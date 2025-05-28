from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from PIL import Image
import torch
import io
from typing import Optional, Dict, Any

from models import VITContrastiveHF
from utils import (
    device, VideoProcessor, ImageProcessor, PredictionProcessor,
    save_uploaded_file, cleanup_temp_file, get_device_info
)

# Create router
router = APIRouter()

# Global model instances (will be initialized on first use)
models = {}

def get_model(classifier_type: str) -> VITContrastiveHF:
    """Get or create model instance."""
    if classifier_type not in models:
        try:
            model = VITContrastiveHF(classificator_type=classifier_type)
            model.to_device(device)
            model.eval()
            models[classifier_type] = model
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")
    
    return models[classifier_type]

@router.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Deepfake Detection API",
        "version": "1.0.0",
        "description": "API for detecting deepfakes in images and videos using Vision Transformer models",
        "endpoints": {
            "/detect/image": "Detect deepfakes in images",
            "/detect/video": "Detect deepfakes in videos",
            "/health": "Health check endpoint",
            "/models": "List available models"
        }
    }

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "device_info": get_device_info(),
        "loaded_models": list(models.keys())
    }

@router.get("/models")
async def list_models():
    """List available classifier models."""
    return {
        "available_models": [
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
        "default_model": "knn"
    }

import base64
import io
from PIL import Image

@router.post("/detect/image")
async def detect_image_deepfake(
    file: UploadFile = File(...),
    model_type: str = Form(default="knn")
):
    """
    Detect deepfakes in uploaded image.
    
    Args:
        file: Image file to analyze
        model_type: Classifier type (knn, linear, svm)
    
    Returns:
        Prediction results with base64 encoded image
    """
    # Validate model type
    if model_type not in ['knn', 'linear', 'svm']:
        raise HTTPException(
            status_code=400, 
            detail="Invalid model_type. Choose from: knn, linear, svm"
        )
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    try:
        # Read and process image
        file_content = await file.read()
        image = Image.open(io.BytesIO(file_content)).convert('RGB')
        
        # Convert image to base64
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='JPEG')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        
        # Get model
        model = get_model(model_type)
        
        # Preprocess image
        input_tensor = ImageProcessor.preprocess_image(image).to(device)
        
        # Make prediction
        with torch.no_grad():
            prediction = model.forward(input_tensor).item()
        
        # Process results
        result = PredictionProcessor.process_single_prediction(prediction, model_type)
        
        return {
            "success": True,
            "filename": file.filename,
            "model_used": model_type,
            "result": result,
            "image_base64": img_base64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.post("/detect/video")
async def detect_video_deepfake(
    file: UploadFile = File(...),
    model_type: str = Form(default="knn"),
    frame_rate: Optional[float] = Form(default=None),
    max_frames: int = Form(default=30)
):
    """
    Detect deepfakes in uploaded video by analyzing frames.
    
    Args:
        file: Video file to analyze
        model_type: Classifier type (knn, linear, svm)
        frame_rate: Frames per second to extract (None for adaptive)
        max_frames: Maximum number of frames to analyze
    
    Returns:
        Prediction results with frame-by-frame analysis and base64 encoded fake frames
    """
    # Validate model type
    if model_type not in ['knn', 'linear', 'svm']:
        raise HTTPException(
            status_code=400,
            detail="Invalid model_type. Choose from: knn, linear, svm"
        )
    
    # Validate file type
    if not file.content_type.startswith('video/'):
        raise HTTPException(
            status_code=400,
            detail="File must be a video"
        )
    
    # Validate parameters
    if max_frames <= 0 or max_frames > 100:
        raise HTTPException(
            status_code=400,
            detail="max_frames must be between 1 and 100"
        )
    
    if frame_rate is not None and (frame_rate <= 0 or frame_rate > 60):
        raise HTTPException(
            status_code=400,
            detail="frame_rate must be between 0 and 60 fps"
        )
    
    temp_file_path = None
    
    try:
        # Save uploaded video to temporary file
        file_content = await file.read()
        temp_file_path = save_uploaded_file(file_content, suffix='.mp4')
        
        # Extract frames from video
        frames = VideoProcessor.extract_frames(
            temp_file_path, 
            frame_rate=frame_rate, 
            max_frames=max_frames
        )
        
        if not frames:
            raise HTTPException(
                status_code=400,
                detail="Could not extract frames from video"
            )
        
        # Convert frames to tensors
        frame_tensors = VideoProcessor.frames_to_tensors(frames).to(device)
        
        # Get model
        model = get_model(model_type)
        
        # Make predictions on all frames
        with torch.no_grad():
            predictions = model.forward(frame_tensors)
        
        # Process results
        result = PredictionProcessor.process_batch_predictions(predictions, model_type)
        
        # Prepare response data
        response_data = {
            "success": True,
            "filename": file.filename,
            "model_used": model_type,
            "processing_info": {
                "frames_extracted": len(frames),
                "frame_rate_used": frame_rate,
                "max_frames_limit": max_frames
            },
            "result": result
        }
        
        # If video is detected as fake, include base64 encoded fake frames
        if result.get('overall_prediction') == 'Fake' or result.get('likely_fake', False):
            fake_frames_base64 = []
            
            # Get individual frame predictions from the processed result
            individual_predictions = result.get('individual_predictions', [])
            
            for i, (frame, pred_data) in enumerate(zip(frames, individual_predictions)):
                # Check if this frame is predicted as fake
                if pred_data.get('is_fake', False) or pred_data.get('prediction') == 'Fake':
                    # Convert PIL Image to base64
                    if hasattr(frame, 'save'):  # PIL Image
                        img_buffer = io.BytesIO()
                        frame.save(img_buffer, format='JPEG')
                        img_buffer.seek(0)
                        frame_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                    else:  # numpy array or other format
                        # Convert to PIL Image first
                        if hasattr(frame, 'shape') and len(frame.shape) == 3:  # numpy array
                            pil_frame = Image.fromarray(frame.astype('uint8'))
                        else:
                            pil_frame = frame
                        
                        img_buffer = io.BytesIO()
                        pil_frame.save(img_buffer, format='JPEG')
                        img_buffer.seek(0)
                        frame_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                    
                    fake_frames_base64.append({
                        "frame_index": i,
                        "prediction": pred_data.get('prediction', 'Unknown'),
                        "confidence": pred_data.get('confidence', 0.0),
                        "raw_prediction": pred_data.get('raw_prediction', 0),
                        "image_base64": frame_base64
                    })
            
            response_data["fake_frames"] = fake_frames_base64
            response_data["fake_frames_count"] = len(fake_frames_base64)
        
        return response_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

    finally:
        # Cleanup temporary file
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

@router.post("/detect/batch")
async def detect_batch_images(
    files: list[UploadFile] = File(...),
    model_type: str = Form(default="knn")
):
    """
    Detect deepfakes in multiple images.

    Args:
        files: List of image files to analyze
        model_type: Classifier type (knn, linear, svm)

    Returns:
        Batch prediction results with base64-encoded images
    """
    if model_type not in ['knn', 'linear', 'svm']:
        raise HTTPException(
            status_code=400,
            detail="Invalid model_type. Choose from: knn, linear, svm"
        )

    if len(files) > 20:
        raise HTTPException(
            status_code=400,
            detail="Maximum 20 files allowed in batch processing"
        )

    results = []

    try:
        model = get_model(model_type)

        for file in files:
            if not file.content_type.startswith('image/'):
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "File is not an image"
                })
                continue

            try:
                file_content = await file.read()

                # Load and convert image
                image = Image.open(io.BytesIO(file_content)).convert('RGB')

                # Preprocess image
                input_tensor = ImageProcessor.preprocess_image(image).to(device)

                # Predict
                with torch.no_grad():
                    prediction = model.forward(input_tensor).item()

                result = PredictionProcessor.process_single_prediction(prediction, model_type)

                # Base64 encode the original image
                buffered = io.BytesIO()
                image.save(buffered, format="JPEG")
                encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')

                results.append({
                    "filename": file.filename,
                    "success": True,
                    "result": result,
                    "image_base64": encoded_image
                })

            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": str(e)
                })

        successful_results = [r for r in results if r['success']]
        if successful_results:
            fake_count = sum(1 for r in successful_results if r['result']['is_fake'])
            total_count = len(successful_results)
            fake_percentage = (fake_count / total_count) * 100
        else:
            fake_count = 0
            total_count = 0
            fake_percentage = 0

        return {
            "success": True,
            "model_used": model_type,
            "batch_summary": {
                "total_files": len(files),
                "successful_predictions": len(successful_results),
                "failed_predictions": len(files) - len(successful_results),
                "fake_images": fake_count,
                "fake_percentage": fake_percentage
            },
            "individual_results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in batch processing: {str(e)}")
