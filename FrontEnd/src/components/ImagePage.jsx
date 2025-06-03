import React, { useRef, useState } from 'react';
import ImageFooter from '../Footer/ImageFooter'; // Assuming correct path to Footer
import ImageResult from './ImageResult'; // Assuming correct path to ImageResult

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

  // Centralized file handling logic
  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file); // Create a URL for preview
      setImageFile(file); // Store the file object
      setImageURL(url); // Store the URL for preview
      setMessage(''); // Clear any previous messages
    } else if (file) { // Only set message if a file was selected but it's invalid
      setMessage('Please upload a valid image file (jpg, jpeg, png).');
      setImageFile(null);
      setImageURL(null);
    }
  };

  // Handles the file drop event
  const handleDrop = (e) => {
    e.preventDefault();
    setHighlight(false); // Remove highlight on drop
    const file = e.dataTransfer.files[0]; // Get the dropped file
    handleFile(file);
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
    handleFile(file);
  };

  // Handles model type selection change (passed to ImageFooter)
  const handleModelTypeChange = (newModelType) => { // Expects newModelType directly
    setModelType(newModelType);
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
      setPredictionData({ ...result, imageURL: imageURL, filename: imageFile.name }); // Also pass the filename for result display
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
        // When using react-router-dom, you would navigate and pass state like this:
        // navigate('/image-result', { state: predictionData });
        // But since we are simulating, we render the component directly
        <ImageResult data={predictionData} onGoBack={() => {
          setShowResult(false);
          setImageFile(null); // Clear image data when going back
          setImageURL(null);
          setPredictionData(null);
          setMessage('');
          setModelType('knn'); // Reset model type to default
        }} />
      ) : (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-white font-sans antialiased">
          <div
            className="flex flex-col items-center justify-center px-4 py-12 flex-grow"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse-light p-2">
              Image Deepfake Detection
            </h1>
            <div
              className={`w-full max-w-2xl border-4 border-dashed border-gray-600 rounded-3xl p-12 text-center bg-gray-800/60 backdrop-blur-sm shadow-xl transition-all duration-300 ease-in-out hover:border-blue-500 hover:shadow-2xl cursor-pointer flex flex-col items-center justify-center min-h-[250px]
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
              onClick={loading ? null : handleClick} // Disable click when loading
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {imageFile ? (
                <p className="text-xl font-semibold text-green-400 flex items-center">
                  <svg className="h-7 w-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Image Selected: <span className="font-bold text-white ml-1">{imageFile.name}</span>
                </p>
              ) : (
                <>
                  {/* Corrected SVG for image upload */}
                  <svg className="w-16 h-16 text-gray-400 mb-4 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                  {/* Corrected text for image upload */}
                  <p className="text-2xl font-bold mb-3 text-gray-200">
                    Drag & Drop or <span className="text-blue-400 hover:text-blue-300 underline">Browse Image</span>
                  </p>
                  {/* Corrected supported formats */}
                  <p className="text-md text-gray-400">
                    Supported formats: .jpg, .jpeg, .png
                  </p>
                </>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Model Type Selection Dropdown - This was previously in the footer,
                but keeping it here for now as per the provided code.
                It's generally better to pass it down as a prop if it's
                part of a separate Footer component. */}
            {/* If you are using the separate Footer.jsx provided earlier,
                you would remove this block from here. */}
            <div className="mt-6 w-full max-w-xl">
              <label htmlFor="model-select" className="block text-gray-300 text-sm font-bold mb-2">
                Select Prediction Model:
              </label>
              <select
                id="model-select"
                value={modelType}
                onChange={(e) => handleModelTypeChange(e.target.value)} // Ensure it passes value correctly
                className="block w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
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
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-center ${loading ? 'bg-blue-800' : 'bg-red-800'} text-white text-sm`}>
                {message}
              </div>
            )}
          </div>
          {/* Ensure ImageFooter receives correct props including model selection */}
          <ImageFooter
            onPredict={handlePredict}
            isLoading={loading}
            onModelSelect={handleModelTypeChange} // Pass the handler
            selectedModel={modelType} // Pass the selected model
          />
        </div>
      )}
    </>
  );
}

export default ImagePage;