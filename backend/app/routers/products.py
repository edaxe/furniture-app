from typing import Optional
from fastapi import APIRouter, Query
from ..models.product import ProductMatchResponse
from ..services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["products"])

product_service = ProductService()


@router.get("/match", response_model=ProductMatchResponse)
async def get_product_matches(
    category: str = Query(
        ...,
        min_length=1,
        description="Furniture category to find matches for",
    ),
    description: Optional[str] = Query(
        default=None,
        description="Detailed furniture description for better product matching",
    ),
    identified_product: Optional[str] = Query(
        default=None,
        description="Identified product name (brand + model) for exact matching",
    ),
    limit: int = Query(
        default=6,
        ge=1,
        le=20,
        description="Maximum number of products to return per category",
    ),
) -> ProductMatchResponse:
    """
    Get product matches for a furniture category.

    Returns exact matches (when identified_product is provided) and similar alternatives.
    The `products` field contains all results concatenated for backward compatibility.
    """
    try:
        exact_products, similar_products = await product_service.get_matches_with_exact(
            category, limit, description, identified_product
        )
        return ProductMatchResponse(
            success=True,
            products=exact_products + similar_products,
            exact_products=exact_products,
            similar_products=similar_products,
            identified_product=identified_product,
            category=category,
        )
    except Exception as e:
        return ProductMatchResponse(
            success=False,
            products=[],
            exact_products=[],
            similar_products=[],
            category=category,
            error=str(e),
        )
