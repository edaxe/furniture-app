from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "FurnishSnap API"
    debug: bool = True

    # Google Cloud Vision API
    google_cloud_project: str = ""
    google_application_credentials: str = ""
    # Base64-encoded credentials JSON for cloud deployment
    google_credentials_base64: str = ""

    # CORS
    cors_origins: list[str] = ["*"]

    # Feature flags
    use_mock_detection: bool = True  # Set to False when using real Vision API

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
