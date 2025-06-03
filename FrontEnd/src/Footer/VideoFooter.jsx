// components/Footer/VideoFooter.jsx
import React from 'react';

function VideoFooter({videoFile, onPredict, onModelSelect, onFrameRateChange, selectedModel, selectedFrameRate, isLoading }) {
  console.log("VEO : ",videoFile);
  
  return (
    <div className="w-full bg-gray-800 p-6 shadow-lg mt-auto rounded-t-xl">
      <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-6">
        {['linear', 'svm', 'knn'].map((model) => (
          <button
            key={model}
            onClick={() => onModelSelect(model)}
            className={`px-6 py-3 rounded-xl shadow-md transition-all duration-300 ease-in-out text-lg font-medium
              ${selectedModel === model
                ? 'bg-blue-600 text-white transform scale-105 ring-2 ring-blue-400'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isLoading}
          >
            {model.toUpperCase()} Model
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mt-4">
        <div className="flex items-center">
          <label htmlFor="frameRate" className="mr-4 text-lg font-medium text-gray-200">
            Frame Rate:
          </label>
          <select
            id="frameRate"
            className={`bg-gray-900 text-white px-5 py-2 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            value={selectedFrameRate}
            onChange={(e) => onFrameRateChange(e.target.value)}
            disabled={isLoading}
          >
            <option value="5">5 FPS</option>
            <option value="10">10 FPS</option>
            <option value="15">15 FPS</option>
            <option value="30">30 FPS</option>
          </select>
        </div>

        <button
          onClick={onPredict}
          className={`px-10 py-3 rounded-xl shadow-lg transition-all duration-300 ease-in-out text-xl font-bold
            ${isLoading
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white transform hover:scale-105'
            }
          `}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Predict'}
        </button>
      </div>
    </div>
  );
}
export default VideoFooter;