import os
import io
import asyncio
import uuid
import random
import base64
import json
import tempfile
from typing import Optional
from PIL import Image as PILImage
from ..models.detection import DetectedFurniture, BoundingBox
from ..config import get_settings


# Furniture categories we can detect
FURNITURE_CATEGORIES = [
    "Sofa",
    "Chair",
    "Table",
    "Bed",
    "Desk",
    "Bookshelf",
    "Cabinet",
    "Dresser",
    "Nightstand",
    "Coffee Table",
    "Dining Table",
    "Office Chair",
    "Armchair",
    "Ottoman",
    "Bench",
    "TV Stand",
    "Console Table",
    "Wardrobe",
    "Sideboard",
    "Bar Stool",
]


class VisionService:
    def __init__(self):
        self.settings = get_settings()
        self._setup_credentials()

    def _setup_credentials(self):
        """Set up Google Cloud credentials from file or base64-encoded env var."""
        # First, try base64-encoded credentials (for cloud deployment)
        if self.settings.google_credentials_base64:
            try:
                creds_json = base64.b64decode(self.settings.google_credentials_base64).decode('utf-8')
                # Write to a temp file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                    f.write(creds_json)
                    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = f.name
                print("Using base64-encoded credentials")
            except Exception as e:
                print(f"Failed to decode base64 credentials: {e}")
        # Fall back to file-based credentials
        elif self.settings.google_application_credentials:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.settings.google_application_credentials
            print("Using file-based credentials")

    async def detect_furniture(
        self, image_content: bytes
    ) -> list[DetectedFurniture]:
        """
        Detect furniture in an image.

        In mock mode, returns random furniture detections.
        In production, uses Gemini for semantic furniture detection,
        with Cloud Vision as a fallback.
        """
        if self.settings.use_mock_detection:
            return self._mock_detect()
        else:
            return await self._real_detect(image_content)

    # Mock brand/model pairs for development
    MOCK_IDENTIFIED_PRODUCTS = [
        ("Herman Miller", "Aeron Chair"),
        ("IKEA", "Kallax Shelf"),
        ("West Elm", "Mid-Century Sofa"),
        ("Pottery Barn", "York Dining Table"),
        ("CB2", "Peekaboo Acrylic Coffee Table"),
        ("Restoration Hardware", "Cloud Sofa"),
    ]

    def _mock_detect(self) -> list[DetectedFurniture]:
        """Generate mock furniture detections for development."""
        num_detections = random.randint(1, 4)
        detections = []

        used_positions = []
        for i in range(num_detections):
            # Generate non-overlapping bounding boxes
            attempts = 0
            while attempts < 10:
                x = random.uniform(0.05, 0.6)
                y = random.uniform(0.1, 0.5)
                width = random.uniform(0.2, 0.35)
                height = random.uniform(0.2, 0.4)

                # Check for overlap with existing boxes
                overlaps = False
                for pos in used_positions:
                    if self._boxes_overlap(
                        (x, y, width, height),
                        pos,
                    ):
                        overlaps = True
                        break

                if not overlaps:
                    used_positions.append((x, y, width, height))
                    break
                attempts += 1

            if attempts < 10:
                # ~40% chance of returning a recognized brand/model
                brand = None
                model_name = None
                identified_product = None
                if random.random() < 0.4:
                    brand, model_name = random.choice(self.MOCK_IDENTIFIED_PRODUCTS)
                    identified_product = f"{brand} {model_name}"

                detection = DetectedFurniture(
                    id=str(uuid.uuid4())[:8],
                    label=random.choice(FURNITURE_CATEGORIES),
                    confidence=random.uniform(0.75, 0.98),
                    boundingBox=BoundingBox(
                        x=x,
                        y=y,
                        width=width,
                        height=height,
                    ),
                    brand=brand,
                    model_name=model_name,
                    identified_product=identified_product,
                )
                detections.append(detection)

        return detections

    def _boxes_overlap(
        self,
        box1: tuple[float, float, float, float],
        box2: tuple[float, float, float, float],
    ) -> bool:
        """Check if two bounding boxes overlap."""
        x1, y1, w1, h1 = box1
        x2, y2, w2, h2 = box2

        return not (
            x1 + w1 < x2 or x2 + w2 < x1 or y1 + h1 < y2 or y2 + h2 < y1
        )

    async def _real_detect(
        self, image_content: bytes
    ) -> list[DetectedFurniture]:
        """
        Use Gemini for semantic furniture detection.
        Falls back to Cloud Vision, then to mock detection.
        After first-pass detection, runs crop-and-reanalyze for refinement.
        """
        detections = []

        # Try Gemini first
        if self.settings.gemini_api_key:
            try:
                detections = await self._gemini_detect(image_content)
            except Exception as e:
                print(f"Gemini detection failed: {e}")

        # Fall back to Cloud Vision
        if not detections:
            try:
                detections = await self._cloud_vision_detect(image_content)
            except Exception as e:
                print(f"Cloud Vision fallback failed: {e}")
                return self._mock_detect()

        # Second pass: crop-and-reanalyze each detection for better details
        if detections and self.settings.gemini_api_key:
            try:
                detections = await self._refine_detections(image_content, detections)
            except Exception as e:
                print(f"Crop-and-reanalyze failed, using first-pass results: {e}")

        return detections

    def _crop_image(self, image_bytes: bytes, bbox: BoundingBox, padding: float = 0.05) -> bytes:
        """Crop an image region defined by a bounding box with padding."""
        img = PILImage.open(io.BytesIO(image_bytes))
        w, h = img.size

        # Calculate crop coordinates with padding
        left = max(0, int((bbox.x - padding) * w))
        top = max(0, int((bbox.y - padding) * h))
        right = min(w, int((bbox.x + bbox.width + padding) * w))
        bottom = min(h, int((bbox.y + bbox.height + padding) * h))

        cropped = img.crop((left, top, right, bottom))
        buf = io.BytesIO()
        cropped.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    async def _focused_detect(self, cropped_bytes: bytes, label: str) -> dict:
        """Second-pass Gemini call on a cropped image for detailed identification."""
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.settings.gemini_api_key)

        focused_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "brand": types.Schema(type=types.Type.STRING, description="Brand name if identifiable, empty string if unknown"),
                "model_name": types.Schema(type=types.Type.STRING, description="Model name if identifiable, empty string if unknown"),
                "description": types.Schema(type=types.Type.STRING, description="Detailed description without brand/model"),
                "color": types.Schema(type=types.Type.STRING, description="Specific color name"),
                "material": types.Schema(type=types.Type.STRING, description="Specific material"),
                "style": types.Schema(type=types.Type.STRING, description="Design style"),
                "estimated_price_range": types.Schema(type=types.Type.STRING, description="Estimated price range"),
            },
            required=["brand", "model_name", "description", "color", "material", "style", "estimated_price_range"],
        )

        response_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={"item": types.Schema(type=types.Type.OBJECT, properties=focused_schema.properties, required=focused_schema.required)},
            required=["item"],
        )

        prompt = (
            f"This is a close-up photo of a {label}. Analyze it carefully and provide:\n"
            "- brand: Identify the brand if possible from design signatures, labels, or distinctive features\n"
            "- model_name: Identify the specific model if possible\n"
            "- description: Detailed search-friendly description (NO brand/model names). "
            "Include silhouette, color, material, upholstery, leg style, hardware, approximate size.\n"
            "- color: Specific color (e.g. 'navy blue' not 'blue')\n"
            "- material: Specific material (e.g. 'walnut wood' not 'wood')\n"
            "- style: Design style (modern, mid-century modern, scandinavian, industrial, etc.)\n"
            "- estimated_price_range: Estimated retail price\n\n"
            "Be as specific as possible. If you can't identify brand/model, use empty string."
        )

        image_part = types.Part.from_bytes(data=cropped_bytes, mime_type="image/jpeg")
        model_name = self._get_gemini_model()

        response = client.models.generate_content(
            model=model_name,
            contents=[image_part, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )

        result = json.loads(response.text)
        return result.get("item", {})

    async def _refine_detections(
        self, image_bytes: bytes, detections: list[DetectedFurniture]
    ) -> list[DetectedFurniture]:
        """Crop each detection and run a focused second-pass for better details."""

        async def refine_one(detection: DetectedFurniture) -> DetectedFurniture:
            try:
                cropped = self._crop_image(image_bytes, detection.boundingBox)
                refined = await self._focused_detect(cropped, detection.label)

                # Only overwrite fields where the second pass found better info
                new_brand = (refined.get("brand", "") or None) or detection.brand
                new_model = (refined.get("model_name", "") or None) or detection.model_name

                new_identified = detection.identified_product
                if new_brand and new_model and not detection.identified_product:
                    new_identified = f"{new_brand} {new_model}"
                elif new_brand and not detection.identified_product:
                    new_identified = new_brand

                return DetectedFurniture(
                    id=detection.id,
                    label=detection.label,
                    confidence=detection.confidence,
                    boundingBox=detection.boundingBox,
                    description=refined.get("description") or detection.description,
                    color=refined.get("color") or detection.color,
                    material=refined.get("material") or detection.material,
                    style=refined.get("style") or detection.style,
                    brand=new_brand,
                    model_name=new_model,
                    identified_product=new_identified,
                    estimated_price_range=refined.get("estimated_price_range") or detection.estimated_price_range,
                )
            except Exception as e:
                print(f"Refinement failed for {detection.label}: {e}")
                return detection

        refined = await asyncio.gather(*[refine_one(d) for d in detections])
        return list(refined)

    def _get_gemini_model(self) -> str:
        """Select Gemini model based on configuration."""
        if self.settings.use_gemini_pro:
            return self.settings.gemini_pro_model
        return self.settings.gemini_model

    async def _gemini_detect(
        self, image_content: bytes
    ) -> list[DetectedFurniture]:
        """Use Gemini for semantic furniture detection with structured output."""
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.settings.gemini_api_key)

        # Define the response schema for structured output
        furniture_item_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "label": types.Schema(
                    type=types.Type.STRING,
                    description=(
                        "Specific furniture type. Use precise categories: "
                        "'Sectional Sofa', 'Loveseat', 'Chesterfield Sofa' (not just 'Sofa'); "
                        "'Dining Chair', 'Office Chair', 'Accent Chair', 'Rocking Chair' (not just 'Chair'); "
                        "'Coffee Table', 'Dining Table', 'Console Table', 'Side Table' (not just 'Table')"
                    ),
                ),
                "description": types.Schema(
                    type=types.Type.STRING,
                    description=(
                        "Detailed search-friendly description WITHOUT brand or model names. "
                        "Include: silhouette shape, color, material, upholstery type, leg style, "
                        "and distinguishing features. "
                        "Example: 'mid-century modern walnut wood credenza with sliding doors, "
                        "tapered legs, and brass hardware, approximately 60 inches wide'"
                    ),
                ),
                "color": types.Schema(
                    type=types.Type.STRING,
                    description="Specific color: 'navy blue', 'charcoal gray', 'walnut brown', 'cream white' (not just 'blue' or 'brown')",
                ),
                "material": types.Schema(
                    type=types.Type.STRING,
                    description=(
                        "Specific primary material: 'walnut wood', 'white oak', 'top-grain leather', "
                        "'performance velvet', 'brushed steel', 'marble' (not just 'wood' or 'fabric')"
                    ),
                ),
                "style": types.Schema(
                    type=types.Type.STRING,
                    description=(
                        "Design style from this list: modern, mid-century modern, scandinavian, "
                        "industrial, farmhouse, traditional, transitional, art deco, bohemian, "
                        "coastal, minimalist, contemporary, rustic, glam"
                    ),
                ),
                "brand": types.Schema(
                    type=types.Type.STRING,
                    description=(
                        "Brand name if recognizable. Look for design signatures: "
                        "Herman Miller (ergonomic mesh, Eames shapes), IKEA (flat-pack, minimal Scandi), "
                        "West Elm (mid-century lines), Restoration Hardware (oversized, weathered), "
                        "CB2 (clean modern), Pottery Barn (traditional American), "
                        "Article (modern minimalist), Crate & Barrel (transitional). "
                        "Empty string if unknown."
                    ),
                ),
                "model_name": types.Schema(
                    type=types.Type.STRING,
                    description="Model name if recognizable, e.g. 'Aeron Chair', 'Kallax', 'Ektorp'. Empty string if unknown.",
                ),
                "estimated_price_range": types.Schema(
                    type=types.Type.STRING,
                    description="Estimated retail price range, e.g. '$200-$400', '$1000-$2000'",
                ),
                "confidence": types.Schema(
                    type=types.Type.NUMBER,
                    description="Confidence score from 0 to 1",
                ),
                "bounding_box": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "x": types.Schema(type=types.Type.NUMBER, description="Normalized x coordinate (0-1)"),
                        "y": types.Schema(type=types.Type.NUMBER, description="Normalized y coordinate (0-1)"),
                        "width": types.Schema(type=types.Type.NUMBER, description="Normalized width (0-1)"),
                        "height": types.Schema(type=types.Type.NUMBER, description="Normalized height (0-1)"),
                    },
                    required=["x", "y", "width", "height"],
                ),
            },
            required=["label", "description", "color", "material", "style", "brand", "model_name", "estimated_price_range", "confidence", "bounding_box"],
        )

        response_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "furniture_items": types.Schema(
                    type=types.Type.ARRAY,
                    items=furniture_item_schema,
                ),
            },
            required=["furniture_items"],
        )

        prompt = (
            "You are an expert furniture identifier. Analyze this image and identify ALL furniture items visible.\n\n"
            "For each piece of furniture, provide:\n\n"
            "1. **label**: Use SPECIFIC furniture subcategories, not generic ones.\n"
            "   - Instead of 'Sofa': use 'Sectional Sofa', 'Loveseat', 'Chesterfield Sofa', 'Sleeper Sofa', 'Futon'\n"
            "   - Instead of 'Chair': use 'Dining Chair', 'Office Chair', 'Accent Chair', 'Rocking Chair', 'Lounge Chair'\n"
            "   - Instead of 'Table': use 'Coffee Table', 'Dining Table', 'Console Table', 'Side Table', 'End Table'\n\n"
            "2. **brand**: Identify the brand if possible. Look for design signatures:\n"
            "   - Herman Miller: distinctive ergonomic mesh designs, Eames shell shapes\n"
            "   - IKEA: flat-pack construction, minimal Scandinavian design\n"
            "   - West Elm: mid-century modern lines, warm wood tones\n"
            "   - Restoration Hardware: oversized proportions, weathered finishes\n"
            "   - Use empty string if you cannot identify the brand.\n\n"
            "3. **model_name**: The specific model if identifiable. Use empty string if unknown.\n\n"
            "4. **description**: Detailed search-friendly description. IMPORTANT: Do NOT include brand or model names.\n"
            "   Include: silhouette, color, material, upholstery type, leg style, hardware, approximate dimensions.\n"
            "   Example: 'mid-century modern walnut credenza with sliding doors, tapered legs, and brass hardware'\n\n"
            "5. **color**: Use specific color names ('navy blue' not 'blue', 'charcoal gray' not 'gray')\n\n"
            "6. **material**: Use specific materials ('walnut wood' not 'wood', 'top-grain leather' not 'leather', "
            "'performance velvet' not 'fabric')\n\n"
            "7. **style**: Choose from: modern, mid-century modern, scandinavian, industrial, farmhouse, "
            "traditional, transitional, art deco, bohemian, coastal, minimalist, contemporary, rustic, glam\n\n"
            "8. **estimated_price_range**: Estimated retail price range (e.g., '$500-$800')\n\n"
            "9. **confidence**: How confident you are (0-1)\n\n"
            "10. **bounding_box**: Normalized coordinates (0-1) — x, y for top-left corner, width and height\n\n"
            "Only include actual furniture items. Exclude walls, floors, decorations, plants, and electronics."
        )

        image_part = types.Part.from_bytes(
            data=image_content,
            mime_type="image/jpeg",
        )

        model_name = self._get_gemini_model()
        response = client.models.generate_content(
            model=model_name,
            contents=[image_part, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )

        result = json.loads(response.text)
        furniture_items = result.get("furniture_items", [])

        detections = []
        for item in furniture_items:
            bbox = item.get("bounding_box", {})
            # Clamp bounding box values to valid range
            x = max(0.0, min(1.0, bbox.get("x", 0.0)))
            y = max(0.0, min(1.0, bbox.get("y", 0.0)))
            w = max(0.0, min(1.0 - x, bbox.get("width", 0.2)))
            h = max(0.0, min(1.0 - y, bbox.get("height", 0.2)))

            brand = item.get("brand", "") or None
            model_name_val = item.get("model_name", "") or None
            # Build identified_product from brand + model_name
            identified_product = None
            if brand and model_name_val:
                identified_product = f"{brand} {model_name_val}"
            elif brand:
                identified_product = brand
            elif model_name_val:
                identified_product = model_name_val

            detection = DetectedFurniture(
                id=str(uuid.uuid4())[:8],
                label=item.get("label", "Furniture"),
                confidence=max(0.0, min(1.0, item.get("confidence", 0.8))),
                boundingBox=BoundingBox(x=x, y=y, width=w, height=h),
                description=item.get("description"),
                color=item.get("color"),
                material=item.get("material"),
                style=item.get("style"),
                brand=brand,
                model_name=model_name_val,
                identified_product=identified_product,
                estimated_price_range=item.get("estimated_price_range"),
            )
            detections.append(detection)

        return detections

    async def _cloud_vision_detect(
        self, image_content: bytes
    ) -> list[DetectedFurniture]:
        """
        Use Google Cloud Vision API as a fallback detector.
        Requires GOOGLE_APPLICATION_CREDENTIALS env variable.
        """
        from google.cloud import vision

        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_content)

        # Use object localization for bounding boxes
        response = client.object_localization(image=image)
        objects = response.localized_object_annotations

        detections = []
        for obj in objects:
            # Filter for furniture-related objects
            if self._is_furniture(obj.name):
                vertices = obj.bounding_poly.normalized_vertices
                if len(vertices) >= 4:
                    x_coords = [v.x for v in vertices]
                    y_coords = [v.y for v in vertices]

                    detection = DetectedFurniture(
                        id=str(uuid.uuid4())[:8],
                        label=self._normalize_label(obj.name),
                        confidence=obj.score,
                        boundingBox=BoundingBox(
                            x=min(x_coords),
                            y=min(y_coords),
                            width=max(x_coords) - min(x_coords),
                            height=max(y_coords) - min(y_coords),
                        ),
                    )
                    detections.append(detection)

        return detections

    def _is_furniture(self, label: str) -> bool:
        """Check if a label is furniture-related."""
        furniture_keywords = [
            "chair",
            "sofa",
            "couch",
            "table",
            "desk",
            "bed",
            "cabinet",
            "shelf",
            "bookshelf",
            "dresser",
            "nightstand",
            "ottoman",
            "bench",
            "stool",
            "wardrobe",
            "furniture",
        ]
        label_lower = label.lower()
        return any(keyword in label_lower for keyword in furniture_keywords)

    def _normalize_label(self, label: str) -> str:
        """Normalize Vision API labels to our furniture categories."""
        label_lower = label.lower()

        mappings = {
            "couch": "Sofa",
            "loveseat": "Sofa",
            "settee": "Sofa",
            "office chair": "Office Chair",
            "armchair": "Armchair",
            "dining table": "Dining Table",
            "coffee table": "Coffee Table",
            "end table": "Nightstand",
            "side table": "Nightstand",
            "bookcase": "Bookshelf",
        }

        for key, value in mappings.items():
            if key in label_lower:
                return value

        # Capitalize first letter of each word
        return label.title()
