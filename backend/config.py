import os
from typing import Dict, Any

class Config:
    """Configuration settings for the deepfake detection API."""
    
    # Model configuration
    DEFAULT_MODEL_REPO = "aimagelab/CoDE"
    AVAILABLE_CLASSIFIERS = ["knn", "linear", "svm"]
    DEFAULT_CLASSIFIER = "knn"
    
    # Video processing configuration
    MAX_VIDEO_FRAMES = 100
    DEFAULT_MAX_FRAMES = 30
    MAX_FRAME_RATE = 60
    DEFAULT_FRAME_RATE = None
    
    # File upload configuration
    MAX_FILE_SIZE_MB = 100  # Maximum file size in MB
    MAX_BATCH_FILES = 20    # Maximum files in batch processing
    ALLOWED_IMAGE_TYPES = {
        "image/jpeg", "image/jpg", "image/png", 
        "image/bmp", "image/tiff", "image/webp"
    }
    ALLOWED_VIDEO_TYPES = {
        "video/mp4", "video/avi", "video/mov", 
        "video/wmv", "video/flv", "video/webm"
    }
    
    # API configuration
    API_VERSION = "1.0.0"
    API_TITLE = "Deepfake Detection API"
    API_DESCRIPTION = """
    A FastAPI application for detecting deepfakes in images and videos 
    using Vision Transformer models with contrastive learning.
    """
    
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    RELOAD = os.getenv("RELOAD", "True").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "info")
    
    # CORS configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_METHODS = ["*"]
    CORS_ALLOW_HEADERS = ["*"]
    
    # Model prediction thresholds
    PREDICTION_THRESHOLDS = {
        "high_confidence": 0.8,
        "medium_confidence": 0.6,
        "low_confidence": 0.4
    }
    
    @classmethod
    def get_model_info(cls) -> Dict[str, Any]:
        """Get information about available models."""
        return {
            "repository": cls.DEFAULT_MODEL_REPO,
            "available_classifiers": [
                {
                    "name": "knn",
                    "description": "K-Nearest Neighbors classifier (Default)",
                    "output_format": "0=Real, 1=Fake"
                },
                {
                    "name": "linear", 
                    "description": "Linear classifier",
                    "output_format": "0=Real, 1=Fake"
                },
                {
                    "name": "svm",
                    "description": "Support Vector Machine with One-Class SVM",
                    "output_format": "-1=Real, 1=Fake"
                }
            ],
            "default_classifier": cls.DEFAULT_CLASSIFIER
        }
    
    @classmethod
    def validate_classifier(cls, classifier_type: str) -> bool:
        """Validate if classifier type is supported."""
        return classifier_type in cls.AVAILABLE_CLASSIFIERS
    
    @classmethod
    def get_file_size_limit_bytes(cls) -> int:
        """Get file size limit in bytes."""
        return cls.MAX_FILE_SIZE_MB * 1024 * 1024
    
    @classmethod
    def is_allowed_image_type(cls, content_type: str) -> bool:
        """Check if image content type is allowed."""
        return content_type in cls.ALLOWED_IMAGE_TYPES
    
    @classmethod
    def is_allowed_video_type(cls, content_type: str) -> bool:
        """Check if video content type is allowed."""
        return content_type in cls.ALLOWED_VIDEO_TYPES