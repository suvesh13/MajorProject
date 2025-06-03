// components/Footer/ImageFooter.jsx
import React from 'react';

// ImageFooter now accepts onModelSelect and selectedModel props
const ImageFooter = ({ onPredict, isLoading, onModelSelect, selectedModel }) => {
  return (
    <div className="w-full bg-gray-800 p-6 shadow-lg mt-auto rounded-t-xl">
      {/* Model Selection Buttons - Styled similar to VideoFooter */}
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
        {/* Predict Button - Styled similar to VideoFooter */}
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
};

export default ImageFooter;