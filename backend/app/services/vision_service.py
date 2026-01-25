import uuid
import random
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

    async def detect_furniture(
        self, image_content: bytes
    ) -> list[DetectedFurniture]:
        """
        Detect furniture in an image.

        In mock mode, returns random furniture detections.
        In production, would use Google Cloud Vision API.
        """
        if self.settings.use_mock_detection:
            return self._mock_detect()
        else:
            return await self._real_detect(image_content)

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
        Use Google Cloud Vision API for real detection.

        This would be implemented when moving to production.
        Requires GOOGLE_APPLICATION_CREDENTIALS env variable.
        """
        try:
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

        except ImportError:
            print("Google Cloud Vision not installed, using mock detection")
            return self._mock_detect()
        except Exception as e:
            print(f"Vision API error: {e}")
            return self._mock_detect()

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
