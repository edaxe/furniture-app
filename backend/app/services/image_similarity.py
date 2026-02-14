import io
import json
import asyncio
from typing import Optional
from PIL import Image as PILImage
from ..config import get_settings


class ImageSimilarityService:
    """Score visual similarity between a reference furniture image and product images using Gemini."""

    def __init__(self):
        self.settings = get_settings()

    def crop_furniture(self, image_bytes: bytes, bounding_box: dict, padding: float = 0.05) -> bytes:
        """Crop a furniture item from the full image using bounding box coordinates."""
        img = PILImage.open(io.BytesIO(image_bytes))
        w, h = img.size

        x = bounding_box.get("x", 0)
        y = bounding_box.get("y", 0)
        bw = bounding_box.get("width", 1)
        bh = bounding_box.get("height", 1)

        left = max(0, int((x - padding) * w))
        top = max(0, int((y - padding) * h))
        right = min(w, int((x + bw + padding) * w))
        bottom = min(h, int((y + bh + padding) * h))

        cropped = img.crop((left, top, right, bottom))
        buf = io.BytesIO()
        cropped.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    async def download_product_images(self, urls: list[str], max_size: int = 512) -> list[Optional[bytes]]:
        """Download and resize product images in parallel. Returns None for failed downloads."""
        import httpx

        async def download_one(url: str) -> Optional[bytes]:
            try:
                async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                    response = await client.get(url)
                    response.raise_for_status()
                    img = PILImage.open(io.BytesIO(response.content))
                    img.thumbnail((max_size, max_size))
                    buf = io.BytesIO()
                    img.save(buf, format="JPEG", quality=85)
                    return buf.getvalue()
            except Exception as e:
                print(f"Failed to download product image {url}: {e}")
                return None

        return await asyncio.gather(*[download_one(url) for url in urls])

    async def score_visual_similarity(
        self,
        reference_image: bytes,
        product_images: list[Optional[bytes]],
        product_names: list[str],
    ) -> dict[int, float]:
        """
        Score visual similarity between reference and product images using Gemini.

        Sends all images in a single request for efficiency.
        Returns {product_index: similarity_score} for successfully scored products.
        """
        from google import genai
        from google.genai import types

        # Filter to only products with downloaded images
        valid_indices = [i for i, img in enumerate(product_images) if img is not None]
        if not valid_indices:
            return {}

        client = genai.Client(api_key=self.settings.gemini_api_key)

        # Build content parts: reference image + all product images
        parts = [
            types.Part.from_bytes(data=reference_image, mime_type="image/jpeg"),
            types.Part.from_text(
                "The FIRST image above is the REFERENCE furniture item from a user's photo. "
                "The following images are product listings. "
                "Rate how visually similar each product is to the reference on a scale of 0.0 to 1.0.\n"
                "Consider: shape/silhouette, color, material, style, proportions, and overall appearance.\n"
                "0.0 = completely different, 0.5 = somewhat similar, 0.8+ = very similar, 1.0 = near identical.\n\n"
                "Products to score:\n"
            ),
        ]

        for idx, i in enumerate(valid_indices):
            parts.append(types.Part.from_bytes(data=product_images[i], mime_type="image/jpeg"))
            parts.append(types.Part.from_text(f"Product {idx + 1}: {product_names[i]}"))

        # Schema for structured response
        score_item = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "product_number": types.Schema(type=types.Type.INTEGER, description="Product number (1-indexed)"),
                "score": types.Schema(type=types.Type.NUMBER, description="Visual similarity score 0.0-1.0"),
            },
            required=["product_number", "score"],
        )

        response_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "scores": types.Schema(type=types.Type.ARRAY, items=score_item),
            },
            required=["scores"],
        )

        parts.append(types.Part.from_text(
            "\nReturn a JSON object with a 'scores' array. "
            "Each entry should have 'product_number' (1-indexed) and 'score' (0.0-1.0)."
        ))

        model_name = self.settings.gemini_model  # Use flash for speed
        response = client.models.generate_content(
            model=model_name,
            contents=parts,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )

        result = json.loads(response.text)
        scores = {}
        for entry in result.get("scores", []):
            product_num = entry.get("product_number", 0)
            score = max(0.0, min(1.0, entry.get("score", 0.0)))
            # Map 1-indexed product_number back to original index
            if 1 <= product_num <= len(valid_indices):
                original_index = valid_indices[product_num - 1]
                scores[original_index] = score

        return scores
