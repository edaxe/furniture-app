from pydantic import BaseModel, Field
from typing import Optional


class BoundingBox(BaseModel):
    x: float = Field(..., ge=0, le=1, description="Normalized x coordinate (0-1)")
    y: float = Field(..., ge=0, le=1, description="Normalized y coordinate (0-1)")
    width: float = Field(..., ge=0, le=1, description="Normalized width (0-1)")
    height: float = Field(..., ge=0, le=1, description="Normalized height (0-1)")


class DetectedFurniture(BaseModel):
    id: str = Field(..., description="Unique identifier for this detection")
    label: str = Field(..., description="Type of furniture detected")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    boundingBox: BoundingBox = Field(..., description="Location in the image")
    description: Optional[str] = Field(None, description="Detailed description for product search")
    color: Optional[str] = Field(None, description="Primary color of the furniture")
    material: Optional[str] = Field(None, description="Primary material of the furniture")
    style: Optional[str] = Field(None, description="Design style (e.g., modern, traditional)")
    brand: Optional[str] = Field(None, description="Identified brand name, e.g. 'Herman Miller'")
    model_name: Optional[str] = Field(None, description="Identified model name, e.g. 'Aeron Chair'")
    identified_product: Optional[str] = Field(None, description="Full identified product string, e.g. 'Herman Miller Aeron Chair'")


class DetectionRequest(BaseModel):
    image_base64: Optional[str] = Field(
        None, description="Base64 encoded image (alternative to file upload)"
    )


class DetectionResponse(BaseModel):
    success: bool = Field(..., description="Whether detection was successful")
    detections: list[DetectedFurniture] = Field(
        default_factory=list, description="List of detected furniture items"
    )
    error: Optional[str] = Field(None, description="Error message if any")
