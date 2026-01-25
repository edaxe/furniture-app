import random
from ..models.product import ProductMatch
from ..data.mock_products import MOCK_PRODUCTS


class ProductService:
    def __init__(self):
        pass

    async def get_matches(
        self, category: str, limit: int = 3
    ) -> list[ProductMatch]:
        """
        Get product matches for a furniture category.

        Currently uses mock data. In production, would integrate with
        affiliate feeds from retailers.
        """
        return self._get_mock_matches(category, limit)

    def _get_mock_matches(
        self, category: str, limit: int
    ) -> list[ProductMatch]:
        """Get mock product matches from our sample data."""
        category_lower = category.lower()

        # Find products matching the category
        matching_products = []
        for product in MOCK_PRODUCTS:
            product_category = product.get("category", "").lower()
            product_name = product.get("name", "").lower()

            # Check if category matches or is contained in name
            if (
                category_lower in product_category
                or category_lower in product_name
                or product_category in category_lower
            ):
                matching_products.append(product)

        # If no exact matches, return random products as fallback
        if not matching_products:
            matching_products = random.sample(
                MOCK_PRODUCTS, min(limit, len(MOCK_PRODUCTS))
            )

        # Select up to limit products
        selected = random.sample(
            matching_products, min(limit, len(matching_products))
        )

        # Convert to ProductMatch objects with similarity scores
        return [
            ProductMatch(
                id=p["id"],
                name=p["name"],
                price=p["price"],
                currency=p.get("currency", "USD"),
                imageUrl=p["imageUrl"],
                productUrl=p["productUrl"],
                retailer=p["retailer"],
                similarity=random.uniform(0.75, 0.95),
            )
            for p in selected
        ]
