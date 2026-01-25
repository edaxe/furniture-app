from pydantic import BaseModel, Field
from typing import Optional


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
        default_factory=list, description="List of matching products"
    )
    category: Optional[str] = Field(None, description="Searched category")
    error: Optional[str] = Field(None, description="Error message if any")
