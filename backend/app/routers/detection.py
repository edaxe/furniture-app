from fastapi import APIRouter, UploadFile, File, HTTPException
from ..models.detection import DetectionResponse
from ..services.vision_service import VisionService

router = APIRouter(prefix="/api", tags=["detection"])

vision_service = VisionService()


@router.post("/detect", response_model=DetectionResponse)
async def detect_furniture(
    image: UploadFile = File(..., description="Image file to analyze")
) -> DetectionResponse:
    """
    Detect furniture in an uploaded image.

    Accepts JPEG, PNG, or WebP images.
    Returns a list of detected furniture items with bounding boxes.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )

    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    content = await image.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB.",
        )

    try:
        detections = await vision_service.detect_furniture(content)
        return DetectionResponse(success=True, detections=detections)
    except Exception as e:
        return DetectionResponse(
            success=False,
            detections=[],
            error=str(e),
        )
