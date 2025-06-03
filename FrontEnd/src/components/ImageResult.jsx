// ImageResult.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate

const ImageResult = ({ data, onGoBack }) => {
  console.log("Prediction Data received in ImageResultPage:", data); // Log the data for debugging

  if (!data || !data.result) { // Check for data and nested 'result' object
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <p className="text-xl mb-4">No valid prediction data available.</p>
        <button
          onClick={onGoBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Destructure properties based on the new API response structure
  const { imageURL, model_used, result } = data;
  const { prediction, is_fake, confidence } = result;

  // Determine if the image is real or fake based on 'is_fake'
  const isReal = !is_fake; // If is_fake is true, then it's not real.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-white font-sans antialiased p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse-light">
        Prediction Result
      </h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        {imageURL && (
          <img
            src={imageURL}
            alt="Uploaded"
            className="max-w-full rounded-lg mb-4 border border-gray-700"
            style={{ maxHeight: '250px', objectFit: 'contain', margin: '0 auto' }}
          />
        )}
        <div className="text-center mb-8">
          {isReal ? ( // Check if the image is determined to be 'Real'
            <p className="text-4xl font-bold text-green-500 flex items-center justify-center">
              <svg className="h-10 w-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              This is a Real Image
            </p>
          ) : (
            <p className="text-4xl font-bold text-red-500 flex items-center justify-center">
              <svg className="h-10 w-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 12a9 9 0 0118 0z"></path></svg>
              This is an AI-Generated Image
            </p>
          )}
        </div>

       <div className="text-lg text-gray-300 mb-6 space-y-2">
          {model_used && (
            <p>
              <span className="font-semibold text-blue-300">Model Used:</span>{' '}
              <span className="font-bold text-white">{model_used.toUpperCase()}</span>
            </p>
          )}
          {confidence !== undefined && (
            <p>
              <span className="font-semibold text-blue-300">Confidence:</span>{' '}
              <span className="font-bold text-white">{(confidence * 100).toFixed(2)}%</span>
            </p>
          )}
          {/* You can add filename or raw_prediction if needed */}
          {data.filename && (
            <p>
              <span className="font-semibold text-blue-300">Filename:</span>{' '}
              <span className="font-bold text-white">{data.filename}</span>
            </p>
          )}
        </div>    
        <button
          onClick={onGoBack}
          className="mt-6 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xl rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Upload Another Image
        </button>
      </div>
    </div>
  );
};

export default ImageResult;