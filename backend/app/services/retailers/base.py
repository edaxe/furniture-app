from abc import ABC, abstractmethod
from typing import Optional
from ...models.product import ProductMatch


class RetailerBase(ABC):
    """Abstract base class for retailer integrations."""

    # Retailer identifier
    name: str = "base"

    # Whether this is a partner (affiliate) or fallback source
    is_partner: bool = False

    # Priority for search order (lower = higher priority)
    priority: int = 100

    @abstractmethod
    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> list[ProductMatch]:
        """
        Search for products matching the query.

        Args:
            query: Search query (description or product name)
            category: Optional furniture category filter
            limit: Maximum number of results to return

        Returns:
            List of ProductMatch objects
        """
        pass

    @abstractmethod
    async def search_exact(
        self,
        product_name: str,
        limit: int = 5,
    ) -> list[ProductMatch]:
        """
        Search for an exact product by name (brand + model).

        Args:
            product_name: Full product name (e.g., "Herman Miller Aeron Chair")
            limit: Maximum number of results

        Returns:
            List of ProductMatch objects for the exact product
        """
        pass

    def is_available(self) -> bool:
        """Check if this retailer integration is configured and available."""
        return True

    def tag_affiliate_link(self, url: str) -> str:
        """
        Add affiliate tracking parameters to a product URL.
        Override in subclasses to add retailer-specific affiliate tags.
        """
        return url
