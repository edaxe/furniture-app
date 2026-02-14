from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .routers import detection_router, products_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    settings = get_settings()
    print(f"Starting {settings.app_name}...")
    print(f"Debug mode: {settings.debug}")
    print(f"Mock detection: {settings.use_mock_detection}")
    print(f"Mock products: {settings.use_mock_products}")
    gemini_model = settings.gemini_pro_model if settings.use_gemini_pro else settings.gemini_model
    print(f"Gemini model: {gemini_model}")
    yield
    # Shutdown
    print("Shutting down...")


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="API for furniture detection and product matching",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(detection_router)
app.include_router(products_router)


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": "1.0.0",
    }


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
