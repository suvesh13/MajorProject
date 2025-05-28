from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

from routes import router
from utils import get_device_info

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Deepfake Detection API")
    device_info = get_device_info()
    logger.info(f"Using device: {device_info['device']}")
    if device_info['cuda_available']:
        logger.info(f"CUDA device: {device_info['cuda_device_name']}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Deepfake Detection API")

# Create FastAPI app
app = FastAPI(
    title="Deepfake Detection API",
    description="""
    A FastAPI application for detecting deepfakes in images and videos using Vision Transformer models.
    
    ## Features
    - **Image Detection**: Analyze single images for deepfake detection
    - **Video Detection**: Analyze videos by extracting and processing frames
    - **Batch Processing**: Process multiple images at once
    - **Multiple Models**: Support for KNN, Linear, and SVM classifiers
    - **GPU Acceleration**: Automatic GPU usage when available
    
    ## Models Available
    - **KNN**: K-Nearest Neighbors classifier (default)
    - **Linear**: Linear classifier
    - **SVM**: Support Vector Machine with One-Class SVM
    
    ## Usage
    1. Upload image or video files
    2. Choose classifier type (optional, defaults to KNN)
    3. For videos, specify frame rate and max frames (optional)
    4. Get prediction results with confidence scores
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": "An unexpected error occurred while processing your request"
        }
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Deepfake Detection API",
        "version": "1.0.0",
        "status": "running",
        "device_info": get_device_info(),
        "api_docs": "/docs",
        "api_base": "/api/v1"
    }

if __name__ == "__main__":
    # Configuration
    config = {
        "host": "0.0.0.0",
        "port": 8000,
        "reload": True,  # Set to False in production
        "log_level": "info",
        "access_log": True
    }
    
    logger.info(f"Starting server on {config['host']}:{config['port']}")
    uvicorn.run("main:app", **config)