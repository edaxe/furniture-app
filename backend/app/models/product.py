from pydantic import BaseModel, Field
from typing import Optional


class ProductMatchRequest(BaseModel):
    session_id: str = Field(..., description="Image session ID from detection response")
    bounding_box: dict = Field(..., description="Bounding box of the furniture item {x, y, width, height}")
    category: str = Field(..., description="Furniture category")
    description: Optional[str] = Field(None, description="Furniture description")
    identified_product: Optional[str] = Field(None, description="Identified product name")
    color: Optional[str] = Field(None, description="Primary color")
    material: Optional[str] = Field(None, description="Primary material")
    style: Optional[str] = Field(None, description="Design style")
    brand: Optional[str] = Field(None, description="Brand name")
    model_name: Optional[str] = Field(None, description="Model name")
    limit: int = Field(default=6, ge=1, le=20, description="Max products to return")


class ProductMatch(BaseModel):
    id: str = Field(..., description="Unique product identifier")
    name: str = Field(..., description="Product name")
    price: float = Field(..., ge=0, description="Product price")
    currency: str = Field(default="USD", description="Currency code")
    imageUrl: str = Field(..., description="Product image URL")
    productUrl: str = Field(..., description="Link to purchase the product")
    retailer: str = Field(..., description="Retailer name")
    similarity: float = Field(..., ge=0, le=1, description="Similarity score (0-1)")


class ProductMatchResponse(BaseModel):
    success: bool = Field(..., description="Whether matching was successful")
    products: list[ProductMatch] = Field(
        default_factory=list, description="List of matching products (backward compat: exact + similar)"
    )
    exact_products: list[ProductMatch] = Field(
        default_factory=list, description="Exact brand/model matches"
    )
    similar_products: list[ProductMatch] = Field(
        default_factory=list, description="Similar alternative products"
    )
    identified_product: Optional[str] = Field(None, description="Identified product name echoed back")
    category: Optional[str] = Field(None, description="Searched category")
    error: Optional[str] = Field(None, description="Error message if any")
