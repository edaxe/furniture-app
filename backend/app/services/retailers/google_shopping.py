import hashlib
from typing import Optional
import httpx
from .base import RetailerBase, calculate_similarity
from ...models.product import ProductMatch
from ...config import get_settings


class GoogleShoppingRetailer(RetailerBase):
    """
    Google Shopping search via Serper.dev API.

    This is the fallback source when partner retailers don't have enough results.
    """

    name = "Google Shopping"
    is_partner = False
    priority = 100  # Lowest priority - fallback only

    def __init__(self):
        self.settings = get_settings()

    def is_available(self) -> bool:
        """Check if Serper API is configured."""
        return bool(self.settings.serper_api_key)

    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> list[ProductMatch]:
        """Search Google Shopping via Serper.dev API."""
        if not self.is_available():
            return []

        # Build search query for API (includes "buy" for better shopping results)
        search_query = f"{query} buy"
        if category:
            search_query = f"{category} {query} buy"

        # Use original description for similarity (without search keywords)
        similarity_query = query if query else category

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://google.serper.dev/shopping",
                    json={"q": search_query, "num": limit},
                    headers={
                        "X-API-KEY": self.settings.serper_api_key,
                        "Content-Type": "application/json",
                    },
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

            return self._parse_results(data, limit, similarity_query=similarity_query)
        except Exception as e:
            print(f"Google Shopping search failed: {e}")
            return []

    async def search_exact(
        self,
        product_name: str,
        limit: int = 5,
    ) -> list[ProductMatch]:
        """Search for an exact product by name."""
        if not self.is_available():
            return []

        query = f"{product_name} buy"

        try:
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

            # Use original product name for similarity (without "buy")
            return self._parse_results(data, limit, is_exact=True, similarity_query=product_name)
        except Exception as e:
            print(f"Google Shopping exact search failed: {e}")
            return []

    def _parse_results(
        self,
        data: dict,
        limit: int,
        is_exact: bool = False,
        similarity_query: str = "",
    ) -> list[ProductMatch]:
        """Parse Serper API response into ProductMatch objects with calculated similarity."""
        shopping_results = data.get("shopping", [])
        products = []

        for item in shopping_results[:limit]:
            link = item.get("link", "")
            product_id = hashlib.md5(link.encode()).hexdigest()[:12]
            price = self._parse_price(item.get("price", "0"))
            product_name = item.get("title", "Unknown Product")

            # Calculate similarity between furniture description and product name
            similarity = calculate_similarity(
                similarity_query, product_name, is_exact_search=is_exact
            )

            product = ProductMatch(
                id=product_id,
                name=product_name,
                price=price,
                currency="USD",
                imageUrl=item.get("imageUrl", ""),
                productUrl=link,
                retailer=item.get("source", "Unknown"),
                similarity=similarity,
            )
            products.append(product)

        return products

    def _parse_price(self, price_str: str) -> float:
        """Parse a price string like '$299.99' to float."""
        try:
            cleaned = "".join(c for c in price_str if c.isdigit() or c == ".")
            return float(cleaned) if cleaned else 0.0
        except ValueError:
            return 0.0
