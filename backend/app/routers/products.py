from typing import Optional
from fastapi import APIRouter, Query
from ..models.product import ProductMatchResponse, ProductMatchRequest
from ..services.product_service import ProductService
from ..services.image_store import image_store
from ..services.image_similarity import ImageSimilarityService

router = APIRouter(prefix="/api/products", tags=["products"])

product_service = ProductService()
image_similarity_service = ImageSimilarityService()


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
    color: Optional[str] = Query(
        default=None,
        description="Primary color of the furniture",
    ),
    material: Optional[str] = Query(
        default=None,
        description="Primary material of the furniture",
    ),
    style: Optional[str] = Query(
        default=None,
        description="Design style of the furniture",
    ),
    brand: Optional[str] = Query(
        default=None,
        description="Brand name for exact matching",
    ),
    model_name: Optional[str] = Query(
        default=None,
        description="Model name for exact matching",
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
            category, limit, description, identified_product,
            color=color, material=material, style=style,
            brand=brand, model_name=model_name,
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


@router.post("/match", response_model=ProductMatchResponse)
async def post_product_matches(request: ProductMatchRequest) -> ProductMatchResponse:
    """
    Get product matches with visual similarity scoring.

    Uses the stored image (from detection session_id) to visually compare
    the detected furniture against product listing images.
    Falls back to text-based matching if visual scoring is unavailable.
    """
    try:
        # Step 1: Get text-based product matches (same as GET flow)
        exact_products, similar_products = await product_service.get_matches_with_exact(
            request.category, request.limit, request.description, request.identified_product,
            color=request.color, material=request.material, style=request.style,
            brand=request.brand, model_name=request.model_name,
        )
        all_products = exact_products + similar_products

        # Step 2: Try visual similarity scoring
        stored_image = image_store.get(request.session_id)
        if stored_image and all_products:
            try:
                # Crop the furniture from the stored image
                cropped_ref = image_similarity_service.crop_furniture(
                    stored_image, request.bounding_box
                )

                # Download product images in parallel
                product_image_urls = [p.imageUrl for p in all_products]
                product_images = await image_similarity_service.download_product_images(product_image_urls)

                # Score visual similarity
                product_names = [p.name for p in all_products]
                visual_scores = await image_similarity_service.score_visual_similarity(
                    cropped_ref, product_images, product_names
                )

                # Update similarity scores with visual scores
                for idx, product in enumerate(all_products):
                    if idx in visual_scores:
                        product.similarity = visual_scores[idx]

                # Re-sort by similarity
                all_products.sort(key=lambda p: p.similarity, reverse=True)

                # Re-split into exact and similar
                exact_set = {p.id for p in exact_products}
                exact_products = [p for p in all_products if p.id in exact_set]
                similar_products = [p for p in all_products if p.id not in exact_set]

            except Exception as e:
                print(f"Visual similarity scoring failed, using text-based scores: {e}")

        return ProductMatchResponse(
            success=True,
            products=exact_products + similar_products,
            exact_products=exact_products,
            similar_products=similar_products,
            identified_product=request.identified_product,
            category=request.category,
        )
    except Exception as e:
        return ProductMatchResponse(
            success=False,
            products=[],
            exact_products=[],
            similar_products=[],
            category=request.category,
            error=str(e),
        )
