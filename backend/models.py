import transformers
from huggingface_hub import hf_hub_download
import torch
import torch.nn as nn
import joblib
from typing import Optional

class VITContrastiveHF(nn.Module):
    """
    Vision Transformer model for deepfake detection using contrastive learning.
    Supports three classifier types: svm, linear, and knn.
    
    Prediction outputs:
    - linear/knn: 0 = Real, 1 = Fake
    - svm: -1 = Real, 1 = Fake
    """
    
    def __init__(self, repo_name: str = 'aimagelab/CoDE', classificator_type: str = 'knn'):
        super(VITContrastiveHF, self).__init__()
        
        if classificator_type not in ['svm', 'linear', 'knn']:
            raise ValueError('Selected an invalid classifier. Choose from: svm, linear, knn')
        
        self.classificator_type = classificator_type
        self.repo_name = repo_name
        
        # Load the base model
        self.model = transformers.AutoModel.from_pretrained(repo_name)
        self.model.pooler = nn.Identity()
        
        # Load processor
        self.processor = transformers.AutoProcessor.from_pretrained(repo_name)
        self.processor.do_resize = False
        
        # Load the appropriate classifier
        self._load_classifier()
    
    def _load_classifier(self):
        """Load the classifier based on the specified type."""
        classifier_files = {
            'svm': 'sklearn/ocsvm_kernel_poly_gamma_auto_nu_0_1_crop.joblib',
            'linear': 'sklearn/linear_tot_classifier_epoch-32.sav',
            'knn': 'sklearn/knn_tot_classifier_epoch-32.sav'
        }
        
        file_path = hf_hub_download(
            repo_id=self.repo_name, 
            filename=classifier_files[self.classificator_type]
        )
        self.classifier = joblib.load(file_path)
    
    def forward(self, x: torch.Tensor, return_feature: bool = False) -> torch.Tensor:
        """
        Forward pass through the model.
        
        Args:
            x: Input tensor of shape (batch_size, channels, height, width)
            return_feature: If True, return raw features instead of predictions
            
        Returns:
            Predictions or features based on return_feature flag
        """
        features = self.model(x)
        
        if return_feature:
            return features
        
        # Extract CLS token features
        features = features.last_hidden_state[:, 0, :].cpu().detach().numpy()
        
        # Get predictions from classifier
        predictions = self.classifier.predict(features)
        
        return torch.from_numpy(predictions)
    
    def predict_single(self, x: torch.Tensor) -> str:
        """
        Predict a single image and return human-readable result.
        
        Args:
            x: Input tensor
            
        Returns:
            String indicating 'Real' or 'Fake'
        """
        with torch.no_grad():
            prediction = self.forward(x).item()
            
            if self.classificator_type in ['linear', 'knn']:
                return 'Fake' if prediction == 1 else 'Real'
            else:  # svm
                return 'Fake' if prediction == 1 else 'Real'
    
    def to_device(self, device: torch.device):
        """Move model to specified device."""
        self.model.to(device)
        return self