import asyncio
import random
import hashlib
from typing import Optional
from ..models.product import ProductMatch
from ..data.mock_products import MOCK_PRODUCTS
from ..config import get_settings
from .retailers import WayfairRetailer, GoogleShoppingRetailer
from .retailers.base import RetailerBase, calculate_similarity


class ProductService:
    """
    Multi-source product search service.

    Search priority (Option A):
    1. Query all partner retailers in parallel (Wayfair, etc.)
    2. If partner results < min_partner_results, supplement with Google Shopping
    3. Return combined results
    """

    def __init__(self):
        self.settings = get_settings()

        # Initialize retailer integrations
        self.partner_retailers: list[RetailerBase] = [
            WayfairRetailer(),
            # Add more partner retailers here as they're integrated:
            # TargetRetailer(),
            # AmazonRetailer(),
        ]

        self.fallback_retailer = GoogleShoppingRetailer()

    async def get_matches(
        self, category: str, limit: int = None, description: Optional[str] = None
    ) -> list[ProductMatch]:
        """
        Get product matches for a furniture category.

        Queries partner retailers first, falls back to Google Shopping if needed.
        """
        if limit is None:
            limit = self.settings.default_product_limit

        if self.settings.use_mock_products:
            query = description if description else f"{category} furniture"
            return self._get_mock_matches(category, limit, query)

        # Build search query
        query = description if description else f"{category} furniture"

        # Get results from multi-source search
        results = await self._search_all_sources(
            query=query,
            category=category,
            limit=limit,
        )

        if not results:
            return self._get_mock_matches(category, limit, query)

        return results

    async def get_matches_with_exact(
        self,
        category: str,
        limit: int = None,
        description: Optional[str] = None,
        identified_product: Optional[str] = None,
    ) -> tuple[list[ProductMatch], list[ProductMatch]]:
        """
        Get both exact and similar product matches.

        Returns (exact_products, similar_products).
        - exact_products: Results for the identified brand/model
        - similar_products: Alternative products matching the description
        """
        if limit is None:
            limit = self.settings.default_product_limit

        if self.settings.use_mock_products:
            similar_query = description if description else f"{category} furniture"
            if identified_product:
                return (
                    self._get_mock_exact(identified_product, limit),
                    self._get_mock_matches(category, limit, similar_query),
                )
            return [], self._get_mock_matches(category, limit, similar_query)

        # Build similar search query (without brand/model)
        similar_query = description if description else f"{category} furniture"

        if identified_product:
            # Run exact and similar searches in parallel
            exact_task = self._search_exact_all_sources(identified_product, limit)
            similar_task = self._search_all_sources(similar_query, category, limit)

            exact_products, similar_products = await asyncio.gather(
                exact_task, similar_task
            )
            return exact_products, similar_products
        else:
            similar_products = await self._search_all_sources(
                similar_query, category, limit
            )
            return [], similar_products

    async def _search_all_sources(
        self,
        query: str,
        category: Optional[str],
        limit: int,
    ) -> list[ProductMatch]:
        """
        Search all sources with partner priority.

        1. Query all available partner retailers in parallel
        2. If total partner results < min_partner_results, query Google Shopping
        3. Combine and return up to limit results
        """
        all_results: list[ProductMatch] = []

        # Step 1: Query partner retailers in parallel
        available_partners = [r for r in self.partner_retailers if r.is_available()]

        if available_partners:
            partner_tasks = [
                retailer.search(query, category, limit)
                for retailer in available_partners
            ]
            partner_results = await asyncio.gather(*partner_tasks, return_exceptions=True)

            for results in partner_results:
                if isinstance(results, list):
                    all_results.extend(results)

        # Step 2: Fall back to Google Shopping if not enough partner results
        if len(all_results) < self.settings.min_partner_results:
            if self.fallback_retailer.is_available():
                needed = limit - len(all_results)
                fallback_results = await self.fallback_retailer.search(
                    query, category, needed
                )
                all_results.extend(fallback_results)

        # Step 3: Deduplicate by product name similarity and return up to limit
        deduplicated = self._deduplicate_results(all_results)
        return deduplicated[:limit]

    async def _search_exact_all_sources(
        self,
        product_name: str,
        limit: int,
    ) -> list[ProductMatch]:
        """
        Search for exact product across all sources.

        Same priority logic: partners first, then Google Shopping fallback.
        """
        all_results: list[ProductMatch] = []

        # Query partner retailers in parallel
        available_partners = [r for r in self.partner_retailers if r.is_available()]

        if available_partners:
            partner_tasks = [
                retailer.search_exact(product_name, limit)
                for retailer in available_partners
            ]
            partner_results = await asyncio.gather(*partner_tasks, return_exceptions=True)

            for results in partner_results:
                if isinstance(results, list):
                    all_results.extend(results)

        # Fall back to Google Shopping if not enough results
        if len(all_results) < self.settings.min_partner_results:
            if self.fallback_retailer.is_available():
                needed = limit - len(all_results)
                fallback_results = await self.fallback_retailer.search_exact(
                    product_name, needed
                )
                all_results.extend(fallback_results)

        deduplicated = self._deduplicate_results(all_results)
        return deduplicated[:limit]

    def _deduplicate_results(
        self, products: list[ProductMatch]
    ) -> list[ProductMatch]:
        """
        Remove duplicate products based on name similarity.

        Keeps partner retailer results over fallback results when duplicates found.
        """
        seen_names: dict[str, ProductMatch] = {}

        # Sort by similarity (descending) so we keep higher-similarity items
        sorted_products = sorted(products, key=lambda p: p.similarity, reverse=True)

        for product in sorted_products:
            # Normalize name for comparison
            normalized = product.name.lower().strip()

            # Simple deduplication - could be enhanced with fuzzy matching
            if normalized not in seen_names:
                seen_names[normalized] = product

        return list(seen_names.values())

    def _get_mock_exact(
        self, identified_product: str, limit: int
    ) -> list[ProductMatch]:
        """Get mock exact product matches for development."""
        mock_exact = []
        retailers = ["Wayfair", "Amazon", "Design Within Reach", "Crate & Barrel"]
        variants = ["", " - New", " - Refurbished", " - Open Box", " - Floor Model"]

        for i in range(min(limit, len(variants))):
            product_name = f"{identified_product}{variants[i]}"
            # Calculate similarity - exact matches should be very high
            similarity = calculate_similarity(
                identified_product, product_name, is_exact_search=True
            )
            mock_exact.append(
                ProductMatch(
                    id=hashlib.md5(f"{identified_product}-exact-{i}".encode()).hexdigest()[:12],
                    name=product_name,
                    price=round(random.uniform(200, 1500), 2),
                    currency="USD",
                    imageUrl="https://via.placeholder.com/150",
                    productUrl=f"https://example.com/product/{i}",
                    retailer=retailers[i % len(retailers)],
                    similarity=similarity,
                )
            )
        return mock_exact

    def _get_mock_matches(
        self, category: str, limit: int, search_query: str = ""
    ) -> list[ProductMatch]:
        """Get mock product matches from our sample data."""
        category_lower = category.lower()

        # Find products matching the category
        matching_products = []
        for product in MOCK_PRODUCTS:
            product_category = product.get("category", "").lower()
            product_name = product.get("name", "").lower()

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

        # Use search query for similarity calculation, fallback to category
        query_for_similarity = search_query if search_query else f"{category} furniture"

        return [
            ProductMatch(
                id=p["id"],
                name=p["name"],
                price=p["price"],
                currency=p.get("currency", "USD"),
                imageUrl=p["imageUrl"],
                productUrl=p["productUrl"],
                retailer=p["retailer"],
                similarity=calculate_similarity(query_for_similarity, p["name"]),
            )
            for p in selected
        ]
