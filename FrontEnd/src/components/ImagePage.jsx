import React, { useRef, useState } from 'react';
// useNavigate is removed as we are simulating navigation internally
// import { useNavigate } from 'react-router-dom';

// Placeholder for ImageFooter component, as it was imported but not defined.
// In a real application, this would be in its own file.
const ImageFooter = ({ onPredict, isLoading }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-center items-center shadow-lg">
      <button
        onClick={onPredict}
        disabled={isLoading} // Disable button when loading
        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Predicting...' : 'Predict'}
      </button>
    </div>
  );
};

// New component to display the image prediction results
const ImageResultPage = ({ data, onGoBack }) => {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-6">Prediction Result</h2>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        {imageURL && (
          <img
            src={imageURL}
            alt="Uploaded"
            className="max-w-full rounded-lg mb-4 border border-gray-700"
            style={{ maxHeight: '250px', objectFit: 'contain', margin: '0 auto' }}
          />
        )}
        <p className="text-xl font-semibold mb-4">
          This image is: <span className={isReal ? 'text-green-400' : 'text-red-400'}>
            {prediction ? prediction.toUpperCase() : (isReal ? 'REAL' : 'FAKE')}
          </span>
        </p>
        <div className="text-sm text-gray-300">
          {model_used && <p>Model Used: {model_used.toUpperCase()}</p>}
          {confidence !== undefined && <p>Confidence: {(confidence * 100).toFixed(2)}%</p>}
          {/* You can add filename or raw_prediction if needed */}
          {data.filename && <p>Filename: {data.filename}</p>}
        </div>
        <button
          onClick={onGoBack}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Upload Another Image
        </button>
      </div>
    </div>
  );
};


function ImagePage() {
  const inputRef = useRef(null);
  const [highlight, setHighlight] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [loading, setLoading] = useState(false); // New state for loading indicator
  const [message, setMessage] = useState(''); // New state for user messages
  const [showResult, setShowResult] = useState(false); // State to control showing result page
  const [predictionData, setPredictionData] = useState(null); // State to store prediction results
  // New state for selected model type, defaults to 'knn'
  const [modelType, setModelType] = useState('knn');

  // Handles the click event on the drop area to open file dialog
  const handleClick = () => {
    inputRef.current.click();
  };

  // Handles the file drop event
  const handleDrop = (e) => {
    e.preventDefault();
    setHighlight(false); // Remove highlight on drop
    const file = e.dataTransfer.files[0]; // Get the dropped file
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file); // Create a URL for preview
      setImageFile(file); // Store the file object
      setImageURL(url); // Store the URL for preview
      setMessage(''); // Clear any previous messages
    } else {
      setMessage('Please upload a valid image file (jpg, jpeg, png).');
      setImageFile(null);
      setImageURL(null);
    }
  };

  // Handles drag over event to show highlight
  const handleDragOver = (e) => {
    e.preventDefault();
    setHighlight(true);
  };

  // Handles drag leave event to remove highlight
  const handleDragLeave = () => {
    setHighlight(false);
  };

  // Handles file selection via input change
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file); // Create a URL for preview
      setImageFile(file); // Store the file object
      setImageURL(url); // Store the URL for preview
      setMessage(''); // Clear any previous messages
    } else {
      setMessage('Please select a valid image file (jpg, jpeg, png).');
      setImageFile(null);
      setImageURL(null);
    }
  };

  // Handles model type selection change
  const handleModelTypeChange = (e) => {
    setModelType(e.target.value);
  };

  // Handles the prediction logic, now integrating the API call
  const handlePredict = async () => {
    if (!imageFile) {
      setMessage('Please upload an image first to predict.');
      return;
    }

    setLoading(true); // Set loading to true
    setMessage('Predicting...'); // Show loading message

    const formData = new FormData();
    formData.append('file', imageFile);
    // Use the selected modelType from state
    formData.append('model_type', modelType);

    try {
      console.log("Sending model type:", modelType); // Log the model type being sent
      const response = await fetch('http://127.0.0.1:8000/api/v1/detect/image', {
        method: 'POST',
        body: formData, // FormData automatically sets 'Content-Type': 'multipart/form-data'
      });

      if (!response.ok) {
        // If response is not OK (e.g., 404, 500), throw an error
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get prediction from API.');
      }

      const result = await response.json(); // Parse the JSON response
      setMessage('Prediction successful!');
      console.log("API Response:", result); // Log the full API response

      // Pass the entire API result along with the image URL
      setPredictionData({ ...result, imageURL: imageURL });
      setShowResult(true); // Show the result page

    } catch (error) {
      console.error('Prediction error:', error);
      setMessage(`Prediction failed: ${error.message}`);
    } finally {
      setLoading(false); // Always set loading to false after request completes
    }
  };

  // Conditionally render the ImagePage or ImageResultPage
  return (
    <>
      {showResult ? (
        <ImageResultPage data={predictionData} onGoBack={() => {
          setShowResult(false);
          setImageFile(null); // Clear image data when going back
          setImageURL(null);
          setPredictionData(null);
          setMessage('');
          setModelType('knn'); // Reset model type to default
        }} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-between bg-gray-900 text-white font-inter">
          <div
            className="flex flex-col items-center justify-center px-6 py-10 flex-grow w-full"
          >
            <div
              className={`w-full max-w-xl border-4 border-dashed rounded-2xl p-10 text-center bg-gray-800 text-white cursor-pointer transition-all duration-300 ease-in-out
                ${highlight ? 'border-blue-500 scale-105' : 'border-gray-600'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
              onClick={loading ? null : handleClick} // Disable click when loading
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="text-xl font-semibold mb-4">
                Click or Drag and Drop the Image
              </p>
              <p className="text-sm text-gray-300">
                Supported formats: .jpg, .jpeg, .png
              </p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Model Type Selection Dropdown */}
            <div className="mt-6 w-full max-w-xl">
              <label htmlFor="model-select" className="block text-gray-300 text-sm font-bold mb-2">
                Select Prediction Model:
              </label>
              <select
                id="model-select"
                value={modelType}
                onChange={handleModelTypeChange}
                className="block w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading} // Disable dropdown when loading
              >
                <option value="knn">KNN</option>
                <option value="svm">SVM</option>
                <option value="linear">Linear</option>
              </select>
            </div>


            {imageURL && (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-gray-300 mb-2">Preview:</p>
                <img
                  src={imageURL}
                  alt="Preview"
                  className="max-w-full md:max-w-md rounded-lg shadow-lg border border-gray-700"
                  style={{ maxHeight: '300px', objectFit: 'contain' }} // Ensure image fits well
                />
              </div>
            )}

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-center ${loading ? 'bg-blue-800' : 'bg-red-800'} text-white text-sm`}>
                {message}
              </div>
            )}
          </div>
          <ImageFooter onPredict={handlePredict} isLoading={loading} />
        </div>
      )}
    </>
  );
}

export default ImagePage;
