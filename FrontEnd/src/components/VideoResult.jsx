// components/VideoResult.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

function VideoResult() {
  const location = useLocation();
  const { videoURL, isReal } = location.state || {};

  return (
    <div className="text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Prediction Result</h2>
      {videoURL ? (
        <>
          <video
            src={videoURL}
            controls
            className="mx-auto max-w-md mb-4 rounded-lg shadow-lg"
          />
          <div className="text-lg font-semibold bg-gray-800 text-white px-6 py-4 rounded-xl inline-block">
            {isReal ? '✅ This is a Real Video' : '❌ This is an AI-Generated Video'}
          </div>
        </>
      ) : (
        <p className="text-red-500">No video provided for prediction.</p>
      )}
    </div>
  );
}

export default VideoResult;
