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
    limit: int = Query(
        default=3,
        ge=1,
        le=10,
        description="Maximum number of products to return",
    ),
) -> ProductMatchResponse:
    """
    Get product matches for a furniture category.

    Returns a list of similar products from various retailers.
    """
    try:
        products = await product_service.get_matches(category, limit)
        return ProductMatchResponse(
            success=True,
            products=products,
            category=category,
        )
    except Exception as e:
        return ProductMatchResponse(
            success=False,
            products=[],
            category=category,
            error=str(e),
        )
