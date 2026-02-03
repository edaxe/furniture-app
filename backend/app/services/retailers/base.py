from abc import ABC, abstractmethod
import re
from typing import Optional
from ...models.product import ProductMatch


def calculate_similarity(query: str, product_name: str, is_exact_search: bool = False) -> float:
    """
    Calculate similarity between a search query and a product name.

    Uses word overlap with weighting for furniture-specific terms.
    Returns a score between 0.5 and 0.99.

    Args:
        query: The search query (AI-generated description or product name)
        product_name: The product name from the retailer
        is_exact_search: True if searching for exact brand/model match
    """
    # Normalize and tokenize
    def tokenize(text: str) -> set[str]:
        # Remove common words and normalize
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        words = set(text.split())
        # Remove very common words
        stop_words = {'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'with', 'by', 'buy'}
        return words - stop_words

    query_words = tokenize(query)
    product_words = tokenize(product_name)

    if not query_words or not product_words:
        return 0.70

    # Calculate word overlap (Jaccard-like but weighted)
    common_words = query_words & product_words
    all_words = query_words | product_words

    # Base overlap score
    if not all_words:
        return 0.70

    overlap_score = len(common_words) / len(all_words)

    # High-value furniture keywords get extra weight
    high_value_words = {
        'sofa', 'couch', 'chair', 'table', 'desk', 'bed', 'cabinet', 'shelf',
        'bookshelf', 'dresser', 'nightstand', 'ottoman', 'bench', 'stool',
        'modern', 'mid-century', 'contemporary', 'traditional', 'industrial',
        'leather', 'fabric', 'velvet', 'wood', 'metal', 'glass', 'marble',
        'sectional', 'recliner', 'sleeper', 'convertible', 'adjustable',
        'ergonomic', 'mesh', 'swivel', 'tufted', 'upholstered',
    }

    # Color words
    color_words = {
        'black', 'white', 'gray', 'grey', 'brown', 'beige', 'tan', 'navy',
        'blue', 'green', 'red', 'yellow', 'orange', 'pink', 'purple', 'cream',
    }

    high_value_matches = len(common_words & high_value_words)
    color_matches = len(common_words & color_words)

    # Bonus for high-value and color matches
    bonus = min(0.15, high_value_matches * 0.05 + color_matches * 0.03)

    # For exact searches (brand + model), check if brand words appear
    if is_exact_search:
        # Higher base score for exact searches since they're more targeted
        base_score = 0.80
        # Check how many query words appear in product (directional match)
        if query_words:
            match_ratio = len(common_words) / len(query_words)
            bonus += match_ratio * 0.10
    else:
        base_score = 0.60

    # Calculate final score
    raw_score = base_score + (overlap_score * 0.25) + bonus

    # Clamp between 0.55 and 0.98 (never show 100% unless truly exact)
    final_score = max(0.55, min(0.98, raw_score))

    # Round to 2 decimal places for cleaner display
    return round(final_score, 2)


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
