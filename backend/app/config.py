from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "RoomRadar API"
    debug: bool = True

    # Google Cloud Vision API
    google_cloud_project: str = ""
    google_application_credentials: str = ""
    # Base64-encoded credentials JSON for cloud deployment
    google_credentials_base64: str = ""

    # CORS
    cors_origins: list[str] = ["*"]

    # Gemini API (for furniture detection)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Serper.dev API (for product matching - fallback)
    serper_api_key: str = ""

    # Wayfair API (partner retailer)
    wayfair_api_key: str = ""
    wayfair_affiliate_id: str = ""

    # Product search settings
    min_partner_results: int = 3  # Minimum results from partners before falling back to Google
    default_product_limit: int = 6  # Default number of products to return

    # Feature flags
    use_mock_detection: bool = True  # Set to False when using real Vision API
    use_mock_products: bool = True  # Set to False when using real Serper API

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
