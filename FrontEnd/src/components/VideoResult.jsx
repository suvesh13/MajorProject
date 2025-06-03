// components/VideoResult.jsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { useLocation, useNavigate } from 'react-router-dom';

function VideoResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: predictionResult } = location;

  // State for the local preview URL of the original uploaded video
  const [originalInputFilePreviewURL, setOriginalInputFilePreviewURL] = useState(null);

  // Effect to create and revoke the Object URL for the original video file (client-side)
  useEffect(() => {
    if (predictionResult && predictionResult.videoFile) {
      const url = URL.createObjectURL(predictionResult.videoFile);
      setOriginalInputFilePreviewURL(url);

      // Cleanup function to revoke the URL when the component unmounts or videoFile changes
      return () => {
        URL.revokeObjectURL(url);
        setOriginalInputFilePreviewURL(null);
      };
    }
  }, [predictionResult]); // Re-run effect if predictionResult changes

  console.log("RESVV : ", predictionResult);

  if (!predictionResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-white">
        <p className="text-xl text-red-400">No prediction result found. Please upload a video first.</p>
        <button
          onClick={() => navigate('/main/video')}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Destructure relevant data from predictionResult
  const {
    overallPrediction,
    fakePercentage,
    selectedModel,
    frameRate,
    videoURL, // This is the processed video URL from the backend
    // videoFile, // Already handled by useEffect for local preview
    FACK_A, // This is the array containing your fake frames with image_base64
  } = predictionResult;

  // Ensure FACK_A is treated as an array, default to empty if not present
  const fakeFramesToDisplay = Array.isArray(FACK_A) ? FACK_A : [];

  console.log("FACK ) ) :", fakeFramesToDisplay);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-white font-sans antialiased p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse-light">
        Prediction Result
      </h1>

      <div className="w-full max-w-4xl bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center">
        {/* Section for Original Uploaded Video (Client-Side) */}
        {originalInputFilePreviewURL && (
          <div className="mb-8 w-full">
            <p className="text-xl font-semibold mb-4 text-purple-300">Original Uploaded Video (Client-side)</p>
            <video
              src={originalInputFilePreviewURL}
              controls
              className="w-full h-auto rounded-lg shadow-lg border border-gray-600"
              style={{ maxHeight: '500px' }}
            >
              Your browser does not support the video tag.
            </video>
            <p className="text-sm text-gray-400 mt-2">This is the original video file you uploaded, displayed directly from your browser's memory.</p>
          </div>
        )}

        {/* Section for Processed Video (from Backend) */}
        {videoURL ? (
          <div className="mb-8 w-full">
            <p className="text-xl font-semibold mb-4 text-blue-300">Processed Video (from Backend)</p>
            <video
              src={videoURL} // Use the videoURL from predictionResult state
              controls
              className="w-full h-auto rounded-lg shadow-lg border border-gray-600"
              style={{ maxHeight: '500px' }}
            >
              Your browser does not support the video tag.
            </video>
            <p className="text-sm text-gray-400 mt-2">This is the video after deepfake detection processing, provided by the server.</p>
          </div>
        ) : (
          <p className="text-xl text-red-400 mb-8">Processed video URL not available.</p>
        )}

        {/* --- Section for Detected Fake Image Frames --- */}
        {fakeFramesToDisplay.length > 0 && (
          <div className="mt-8 w-full">
            <h3 className="text-2xl font-bold mb-4 text-red-600 text-center">Detected Fake Frames</h3>
            <p className="text-md text-gray-400 mb-4 text-center">These individual frames were identified as potentially manipulated.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fakeFramesToDisplay.map((frame, index) => (
                <div
                  key={frame.frame_index || index} // Use frame_index for unique key, fallback to array index
                  className="bg-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-600 transform hover:scale-105 transition-transform duration-200"
                >
                  <img
                    // Crucially, prepend the Data URI prefix to the base64 string
                    src={`data:image/jpeg;base64,${frame.image_base64}`}
                    alt={`Fake Frame ${frame.frame_index}`}
                    className="w-full h-auto object-cover aspect-video" // Ensures images maintain aspect ratio
                  />
                  <div className="p-3 text-center">
                    <p className="text-sm font-semibold text-white">Frame: {frame.frame_index}</p>
                    <p className={`text-xs ${frame.prediction === 'Fake' ? 'text-red-400' : 'text-green-400'}`}>
                      Prediction: {frame.prediction}
                    </p>
                    <p className="text-xs text-gray-300">Confidence: {(frame.confidence * 100).toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message if no fake frames are detected/provided */}
        {fakeFramesToDisplay.length === 0 && (
            <p className="mt-4 text-center text-gray-400">No specific fake frames were detected in this video.</p>
        )}

        {/* --- Overall Prediction Result --- */}
        <div className="text-center mb-8 mt-8">
          {overallPrediction === 'Real' ? (
            <p className="text-4xl font-bold text-green-500 flex items-center justify-center">
              <svg className="h-10 w-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              This is a Real Video
            </p>
          ) : (
            <p className="text-4xl font-bold text-red-500 flex items-center justify-center">
              <svg className="h-10 w-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 12a9 9 0 0118 0z"></path></svg>
              This is a Deepfake Video
            </p>
          )}
        </div>

        {/* --- Prediction Details --- */}
        <div className="text-lg text-gray-300 mb-6 space-y-2">
          <p>
            <span className="font-semibold text-blue-300">Model Used:</span>{' '}
            <span className="font-bold text-white">{selectedModel.toUpperCase()}</span>
          </p>
          <p>
            <span className="font-semibold text-blue-300">Frame Rate:</span>{' '}
            <span className="font-bold text-white">{frameRate} FPS</span>
          </p>
          {fakePercentage !== undefined && (
            <p>
              <span className="font-semibold text-blue-300">Fake Confidence:</span>{' '}
              <span className="font-bold text-white">{fakePercentage.toFixed(2)}%</span>
            </p>
          )}
        </div>

        {/* --- Predict Another Video Button --- */}
        <button
          onClick={() => navigate('/main/video')}
          className="mt-6 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xl rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Predict another video
        </button>
      </div>
    </div>
  );
}

export default VideoResult;