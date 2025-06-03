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
         Abstract: To detect manipulated multimedia content, the DeepFake Detection System utilizes advanced artificial 
intelligence methods. A more robust deepfake detection method is offered by the system using audio and video 
analysis. To identify faces and areas of interest, the video module utilizes "YOLO (You Only Look Once)". Next, 
it analyzes the data with "CODE (Contrastive Deepfake Embeddings)" to obtain high-dimensional features and 
find inconsistencies, like unusual textures and facial movements. To detect manipulation, MelodyMachine 
processes the audio by monitoring pitch shifts, tone, phoneme sequence, and temporal consistency. Through cross-
modal analysis by comparing video and audio lip movement timing, the system can perform detection even better. 
An effective tool for identifying deepfakes, this pipeline's multiple steps ensure accurate classification of audio 
and video content. A reliable mechanism for authenticating audiovisual content has been established by the 
coupling of YOLO, CoDE, and MelodyMachine. This method allows for thorough detection..
        
        </p>
      </div>
    </div>
  );
}

export default AbstactPage;
