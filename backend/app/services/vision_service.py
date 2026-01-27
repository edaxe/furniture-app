import os
import uuid
import random
import base64
import json
import tempfile
from typing import Optional
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
        """
        # Try Gemini first
        if self.settings.gemini_api_key:
            try:
                return await self._gemini_detect(image_content)
            except Exception as e:
                print(f"Gemini detection failed: {e}")

        # Fall back to Cloud Vision
        try:
            return await self._cloud_vision_detect(image_content)
        except Exception as e:
            print(f"Cloud Vision fallback failed: {e}")
            return self._mock_detect()

    async def _gemini_detect(
        self, image_content: bytes
    ) -> list[DetectedFurniture]:
        """Use Gemini 2.5 Flash for semantic furniture detection with structured output."""
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.settings.gemini_api_key)

        # Define the response schema for structured output
        furniture_item_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "label": types.Schema(
                    type=types.Type.STRING,
                    description="Furniture type, e.g. 'Office Chair', 'Sofa', 'Coffee Table'",
                ),
                "description": types.Schema(
                    type=types.Type.STRING,
                    description="Detailed description for product search WITHOUT brand or model names, e.g. 'modern black ergonomic mesh office chair with adjustable armrests'",
                ),
                "color": types.Schema(
                    type=types.Type.STRING,
                    description="Primary color of the furniture",
                ),
                "material": types.Schema(
                    type=types.Type.STRING,
                    description="Primary material, e.g. 'wood', 'metal', 'fabric', 'leather', 'mesh'",
                ),
                "style": types.Schema(
                    type=types.Type.STRING,
                    description="Design style, e.g. 'modern', 'traditional', 'mid-century', 'industrial'",
                ),
                "brand": types.Schema(
                    type=types.Type.STRING,
                    description="Brand name if recognizable, e.g. 'Herman Miller', 'IKEA'. Empty string if unknown.",
                ),
                "model_name": types.Schema(
                    type=types.Type.STRING,
                    description="Model name if recognizable, e.g. 'Aeron Chair', 'Kallax'. Empty string if unknown.",
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
            required=["label", "description", "color", "material", "style", "brand", "model_name", "confidence", "bounding_box"],
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
            "Analyze this image and identify ALL furniture items visible. "
            "For each piece of furniture, provide:\n"
            "- label: The furniture type (e.g., 'Office Chair', 'Sofa', 'Coffee Table')\n"
            "- brand: The brand name if you can identify it (e.g., 'Herman Miller', 'IKEA', 'West Elm'). "
            "Use empty string if you cannot identify the brand.\n"
            "- model_name: The specific model name if you can identify it (e.g., 'Aeron Chair', 'Kallax'). "
            "Use empty string if you cannot identify the model.\n"
            "- description: A detailed search-friendly description including color, material, style, "
            "and distinguishing features. IMPORTANT: Do NOT include brand or model names in the description. "
            "The description should be generic enough to find similar products from any brand "
            "(e.g., 'modern black ergonomic mesh office chair with adjustable armrests and lumbar support')\n"
            "- color: The primary color\n"
            "- material: The primary material\n"
            "- style: The design style\n"
            "- confidence: How confident you are this is furniture (0-1)\n"
            "- bounding_box: Approximate normalized coordinates (0-1) of the furniture in the image "
            "(x, y for top-left corner, width and height)\n\n"
            "Only include actual furniture items. Do not include walls, floors, decorations, or electronics."
        )

        image_part = types.Part.from_bytes(
            data=image_content,
            mime_type="image/jpeg",
        )

        response = client.models.generate_content(
            model=self.settings.gemini_model,
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
            model_name = item.get("model_name", "") or None
            # Build identified_product from brand + model_name
            identified_product = None
            if brand and model_name:
                identified_product = f"{brand} {model_name}"
            elif brand:
                identified_product = brand
            elif model_name:
                identified_product = model_name

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
                model_name=model_name,
                identified_product=identified_product,
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
