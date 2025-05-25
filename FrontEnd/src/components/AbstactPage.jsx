import React from "react";
import { Link } from "react-router-dom";

function AbstactPage() {
  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      {/* Background image that stretches with content */}
     <img
        src="/Image/bg1.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" style={{ minHeight: "100%" }}></div>

      {/* Home button */}
      <div className="absolute top-4 right-4 z-10">
        <Link to="/main/home">
          <button className="bg-gray-800 hover:bg-gray-600 px-5 py-2 rounded text-white shadow-lg transition">
            Home
          </button>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
          Abstract
        </h1>
        <p className="text-lg leading-relaxed bg-black bg-opacity-40 p-6 rounded-lg shadow-lg">
         Abstract: As the prevalence of deepfake videos continues to escalate, there is an urgent need for 
        robust and efficient detection methods to combat the potential consequences of misinformation and 
        manipulation in our digital landscape. Deepfake technology, which utilizes advanced artificial 
        intelligence to create highly realistic but fraudulent videos, poses significant threats to trust and 
        authenticity across various domains, including politics, social media, and entertainment. This 
        abstract explores the application of Long Short-Term Memory (LSTM) networks in the realm of 
        deepfake video detection. The proposed methodology involves several key steps, beginning with 
        the preprocessing of video data. This includes the creation of high-quality training datasets and the 
        implementation of data augmentation techniques designed to enhance model generalization and 
        robustness. Furthermore, we delve into the training process and optimization strategies specific to 
        LSTM networks, focusing on hyperparameter tuning and loss function adjustments. By adopting 
        these comprehensive approaches, we aim to achieve optimal performance in deepfake face 
        detection, thereby providing a valuable tool for mitigating the risks associated with manipulated 
        media and preserving the integrity of digital content.
        
        </p>
      </div>
    </div>
  );
}

export default AbstactPage;
