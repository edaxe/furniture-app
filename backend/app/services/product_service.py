import asyncio
import random
import hashlib
from typing import Optional
import httpx
from ..models.product import ProductMatch
from ..data.mock_products import MOCK_PRODUCTS
from ..config import get_settings


class ProductService:
    def __init__(self):
        self.settings = get_settings()

    async def get_matches(
        self, category: str, limit: int = 3, description: Optional[str] = None
    ) -> list[ProductMatch]:
        """
        Get product matches for a furniture category.

        Uses Serper.dev Google Shopping API when configured,
        falls back to mock data otherwise.
        """
        if not self.settings.use_mock_products and self.settings.serper_api_key:
            try:
                return await self._search_shopping(category, limit, description)
            except Exception as e:
                print(f"Serper shopping search failed: {e}")

        return self._get_mock_matches(category, limit)

    async def _search_shopping(
        self, category: str, limit: int, description: Optional[str] = None
    ) -> list[ProductMatch]:
        """Search Google Shopping via Serper.dev API."""
        # Use the detailed description if available, otherwise fall back to category
        query = f"{description} buy" if description else f"{category} furniture buy"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://google.serper.dev/shopping",
                json={"q": query, "num": limit},
                headers={
                    "X-API-KEY": self.settings.serper_api_key,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()

        shopping_results = data.get("shopping", [])

        products = []
        for item in shopping_results[:limit]:
            # Generate a stable ID from the product link
            link = item.get("link", "")
            product_id = hashlib.md5(link.encode()).hexdigest()[:12]

            # Parse price string (e.g., "$299.99") to float
            price = self._parse_price(item.get("price", "0"))

            product = ProductMatch(
                id=product_id,
                name=item.get("title", "Unknown Product"),
                price=price,
                currency="USD",
                imageUrl=item.get("imageUrl", ""),
                productUrl=link,
                retailer=item.get("source", "Unknown"),
                similarity=0.90,
            )
            products.append(product)

        return products

    def _parse_price(self, price_str: str) -> float:
        """Parse a price string like '$299.99' or '299.99' to float."""
        try:
            cleaned = "".join(c for c in price_str if c.isdigit() or c == ".")
            return float(cleaned) if cleaned else 0.0
        except ValueError:
            return 0.0

    async def get_matches_with_exact(
        self,
        category: str,
        limit: int = 3,
        description: Optional[str] = None,
        identified_product: Optional[str] = None,
    ) -> tuple[list[ProductMatch], list[ProductMatch]]:
        """
        Get both exact and similar product matches.

        Returns (exact_products, similar_products).
        Runs both searches in parallel when identified_product is provided.
        """
        if not self.settings.use_mock_products and self.settings.serper_api_key:
            try:
                if identified_product:
                    exact_task = self._search_exact(identified_product, limit)
                    similar_task = self._search_shopping(category, limit, description)
                    exact_products, similar_products = await asyncio.gather(
                        exact_task, similar_task
                    )
                    return exact_products, similar_products
                else:
                    similar_products = await self._search_shopping(category, limit, description)
                    return [], similar_products
            except Exception as e:
                print(f"Serper dual search failed: {e}")

        # Fall back to mock data
        if identified_product:
            return self._get_mock_exact(identified_product, limit), self._get_mock_matches(category, limit)
        return [], self._get_mock_matches(category, limit)

    async def _search_exact(
        self, identified_product: str, limit: int
    ) -> list[ProductMatch]:
        """Search Google Shopping for the exact identified product."""
        query = f"{identified_product} buy"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://google.serper.dev/shopping",
                json={"q": query, "num": limit},
                headers={
                    "X-API-KEY": self.settings.serper_api_key,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()

        shopping_results = data.get("shopping", [])

        products = []
        for item in shopping_results[:limit]:
            link = item.get("link", "")
            product_id = hashlib.md5(link.encode()).hexdigest()[:12]
            price = self._parse_price(item.get("price", "0"))

            product = ProductMatch(
                id=product_id,
                name=item.get("title", "Unknown Product"),
                price=price,
                currency="USD",
                imageUrl=item.get("imageUrl", ""),
                productUrl=link,
                retailer=item.get("source", "Unknown"),
                similarity=0.95,
            )
            products.append(product)

        return products

    def _get_mock_exact(
        self, identified_product: str, limit: int
    ) -> list[ProductMatch]:
        """Get mock exact product matches for development."""
        # Generate mock exact matches based on the identified product name
        mock_exact = []
        retailers = ["Amazon", "Wayfair", "Design Within Reach", "Crate & Barrel"]
        for i in range(min(limit, 3)):
            mock_exact.append(
                ProductMatch(
                    id=hashlib.md5(f"{identified_product}-exact-{i}".encode()).hexdigest()[:12],
                    name=f"{identified_product}" if i == 0 else f"{identified_product} - {['New', 'Refurbished', 'Open Box'][i % 3]}",
                    price=round(random.uniform(200, 1500), 2),
                    currency="USD",
                    imageUrl="https://via.placeholder.com/150",
                    productUrl=f"https://example.com/product/{i}",
                    retailer=retailers[i % len(retailers)],
                    similarity=round(random.uniform(0.92, 0.99), 2),
                )
            )
        return mock_exact

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
