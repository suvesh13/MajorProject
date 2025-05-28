import torch
import cv2
import numpy as np
from PIL import Image
from torchvision import transforms
from typing import List, Tuple, Dict, Any, Optional
import tempfile
import os
from pathlib import Path

# Global device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Image preprocessing transform
image_transform = transforms.Compose([
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

class VideoProcessor:
    """Utility class for processing videos and extracting frames."""
    
    @staticmethod
    def extract_frames(video_path: str, frame_rate: Optional[float] = None, max_frames: int = 30) -> List[np.ndarray]:
        """
        Extract frames from video at specified frame rate.
        
        Args:
            video_path: Path to video file
            frame_rate: Frames per second to extract (None for original rate)
            max_frames: Maximum number of frames to extract
            
        Returns:
            List of frames as numpy arrays
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        original_fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        frames = []
        
        if frame_rate is None:
            # Extract frames at original rate but limit to max_frames
            frame_interval = max(1, total_frames // max_frames)
        else:
            # Calculate frame interval based on desired frame rate
            frame_interval = max(1, int(original_fps / frame_rate))
        
        frame_count = 0
        extracted_count = 0
        
        while cap.isOpened() and extracted_count < max_frames:
            ret, frame = cap.read()
            
            if not ret:
                break
            
            if frame_count % frame_interval == 0:
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(frame_rgb)
                extracted_count += 1
            
            frame_count += 1
        
        cap.release()
        return frames
    
    @staticmethod
    def frames_to_tensors(frames: List[np.ndarray]) -> torch.Tensor:
        """
        Convert list of frames to batch tensor.
        
        Args:
            frames: List of frames as numpy arrays
            
        Returns:
            Batch tensor of shape (batch_size, channels, height, width)
        """
        tensors = []
        
        for frame in frames:
            # Convert numpy array to PIL Image
            pil_image = Image.fromarray(frame)
            
            # Apply preprocessing
            tensor = image_transform(pil_image)
            tensors.append(tensor)
        
        # Stack into batch
        return torch.stack(tensors)

class ImageProcessor:
    """Utility class for processing images."""
    
    @staticmethod
    def preprocess_image(image: Image.Image) -> torch.Tensor:
        """
        Preprocess a PIL image for model inference.
        
        Args:
            image: PIL Image
            
        Returns:
            Preprocessed tensor
        """
        return image_transform(image).unsqueeze(0)
    
    @staticmethod
    def load_and_preprocess(image_path: str) -> torch.Tensor:
        """
        Load and preprocess an image from file path.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed tensor
        """
        image = Image.open(image_path).convert('RGB')
        return ImageProcessor.preprocess_image(image)

class PredictionProcessor:
    """Utility class for processing model predictions."""
    
    @staticmethod
    def process_single_prediction(prediction: int, classifier_type: str) -> Dict[str, Any]:
        """
        Process a single prediction into a structured response.
        
        Args:
            prediction: Raw prediction from model
            classifier_type: Type of classifier used
            
        Returns:
            Dictionary with prediction results
        """
        if classifier_type in ['linear', 'knn']:
            is_fake = prediction == 1
            label = 'Fake' if is_fake else 'Real'
            confidence = 1.0  # These classifiers don't provide confidence scores
        else:  # svm
            is_fake = prediction == 1
            label = 'Fake' if is_fake else 'Real'
            confidence = 1.0
        
        return {
            'prediction': label,
            'is_fake': is_fake,
            'confidence': confidence,
            'raw_prediction': int(prediction)
        }
    
    @staticmethod
    def process_batch_predictions(predictions: torch.Tensor, classifier_type: str) -> Dict[str, Any]:
        """
        Process batch predictions and provide summary statistics.
        
        Args:
            predictions: Batch of predictions
            classifier_type: Type of classifier used
            
        Returns:
            Dictionary with batch prediction results and statistics
        """
        predictions_list = predictions.flatten().tolist()
        processed_predictions = [
            PredictionProcessor.process_single_prediction(pred, classifier_type)
            for pred in predictions_list
        ]
        
        # Calculate statistics
        fake_count = sum(1 for pred in processed_predictions if pred['is_fake'])
        total_count = len(processed_predictions)
        fake_percentage = (fake_count / total_count) * 100 if total_count > 0 else 0
        
        # Determine overall verdict
        overall_verdict = 'Fake' if fake_percentage > 50 else 'Real'
        
        return {
            'overall_prediction': overall_verdict,
            'fake_percentage': fake_percentage,
            'fake_frames': fake_count,
            'total_frames': total_count,
            'individual_predictions': processed_predictions,
            'summary': {
                'likely_fake': fake_percentage > 50,
                'confidence_level': 'High' if fake_percentage > 80 or fake_percentage < 20 else 'Medium'
            }
        }

def save_uploaded_file(file_content: bytes, suffix: str = '') -> str:
    """
    Save uploaded file content to temporary file.
    
    Args:
        file_content: File content as bytes
        suffix: File extension suffix
        
    Returns:
        Path to temporary file
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        tmp_file.write(file_content)
        return tmp_file.name

def cleanup_temp_file(file_path: str):
    """Remove temporary file."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass  # Ignore cleanup errors

def get_device_info() -> Dict[str, Any]:
    """Get information about the current device and CUDA availability."""
    return {
        'device': str(device),
        'cuda_available': torch.cuda.is_available(),
        'cuda_device_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
        'cuda_device_name': torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    }