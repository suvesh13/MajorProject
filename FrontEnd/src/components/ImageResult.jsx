import React from 'react';
import { useLocation } from 'react-router-dom';

function ImageResult() {
  const location = useLocation();
  const { imageURL, isReal } = location.state || {};

  if (!imageURL) {
    return <div className="text-white text-center">No image provided.</div>;
  }

  return (
    <div className="text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Prediction Result</h2>
      <img
        src={imageURL}
        alt="Uploaded"
        className="mx-auto max-w-md mb-4 rounded-lg shadow-md"
      />
      <div className="text-lg font-semibold bg-gray-800 text-white px-6 py-4 rounded-xl inline-block">
        {isReal ? '✅ This is a Real Image' : '❌ This is an AI-Generated Image'}
      </div>
    </div>
  );
}

export default ImageResult;
