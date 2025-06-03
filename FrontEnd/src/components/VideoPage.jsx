// components/VideoPage.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoFooter from '../Footer/VideoFooter'; // Correct path to VideoFooter

function VideoPage() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null); // Local URL for preview
  const [selectedModel, setSelectedModel] = useState('linear');
  const [frameRate, setFrameRate] = useState('15');
  const [maxFrames, setMaxFrames] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [triggerPrediction, setTriggerPrediction] = useState(false); // State to trigger the prediction useEffect

  // States to hold API response data
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState(null);

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoURL(URL.createObjectURL(file));
      // Reset any previous prediction states
      setPredictionResult(null);
      setPredictionError(null);
      setTriggerPrediction(false); // Ensure prediction isn't triggered immediately
    } else {
      showCustomAlert('Please select a valid video file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoURL(URL.createObjectURL(file));
      // Reset any previous prediction states
      setPredictionResult(null);
      setPredictionError(null);
      setTriggerPrediction(false);
    } else {
      showCustomAlert('Please upload a valid video file.');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleFrameRateChange = (rate) => {
    setFrameRate(rate);
  };

  const extractFrames = useCallback(async (file, numFrames = 5) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.autoplay = false;
      video.muted = true;
      video.preload = 'auto';
      video.style.display = 'none'; // Hide video element

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.style.display = 'none'; // Hide canvas element

      const frames = [];
      let currentFrameCount = 0;

      const cleanupElements = () => {
        if (document.body.contains(video)) document.body.removeChild(video);
        if (document.body.contains(canvas)) document.body.removeChild(canvas);
        if (video.src) URL.revokeObjectURL(video.src); // Revoke object URL
      };

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const interval = video.duration / (numFrames + 1); // Distribute frames evenly
        let currentTime = interval;

        const captureFrame = () => {
          if (currentFrameCount < numFrames) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.8)); // Capture as JPEG
            currentFrameCount++;
            currentTime += interval;
            if (currentTime < video.duration) {
              video.currentTime = currentTime;
            } else {
              // Ensure we don't seek beyond duration
              video.pause();
              cleanupElements();
              resolve(frames);
            }
          } else {
            video.pause();
            cleanupElements();
            resolve(frames);
          }
        };

        video.onseeked = () => {
          captureFrame();
        };

        video.onerror = (e) => {
          cleanupElements();
          reject(new Error("Error loading video for frame extraction: " + e.message));
        };

        // Start seeking to the first frame
        video.currentTime = currentTime;
      };

      video.onerror = (e) => {
        cleanupElements();
        reject(new Error("Error loading video metadata for frame extraction: " + e.message));
      };

      // Append to body to ensure metadata loads correctly
      document.body.appendChild(video);
      document.body.appendChild(canvas);
    });
  }, []); // Empty dependency array ensures extractFrames is stable

  // This useEffect handles the actual API call when triggerPrediction is true
  useEffect(() => {
    const performPrediction = async () => {
      if (!triggerPrediction || !videoFile) {
        return; // Only proceed if triggered and a file is selected
      }

      setIsLoading(true);
      setPredictionError(null); // Clear previous errors

      let extractedFrames = [];
      try {
        setIsExtractingFrames(true);
        // Client-side frames for display/preview purposes if needed
        extractedFrames = await extractFrames(videoFile, 5);
      } catch (frameError) {
        console.error('Failed to extract client-side frames:', frameError);
        showCustomAlert('Failed to extract video frames for preview. Proceeding with prediction.');
        extractedFrames = []; // Proceed even if client-side frame extraction fails
      } finally {
        setIsExtractingFrames(false);
      }

      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('model_type', selectedModel);
      formData.append('frame_rate', frameRate);
      formData.append('max_frames', maxFrames);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/detect/video', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const FRAMESS = result.fake_frames;
        console.log(FRAMESS);
        // console.log("Backend response:", result);

        // --- IMPORTANT: Construct the video URL based on your backend's serving static files ---
        // ASSUMPTION: Your backend serves processed videos from a path like /static/
        // Adjust this if your static files are served from a different base URL or path.
        const processedVideoBaseUrl = 'http://127.0.0.1:8000/static/';
        const processedVideoUrl = `${processedVideoBaseUrl}${result.filename}`; // Using 'filename' from backend response

        setPredictionResult({
          isReal: result.result.overall_prediction, // Access nested 'result' object for 'is_real'
          videoURL: processedVideoUrl,   // This comes from your frontend logic after backend response
          selectedModel: selectedModel, // This is your frontend state, but now confirmed by backend's model_used
          frameRate: frameRate,         // This is your frontend state
          //backendMessage: result.message || 'Prediction completed.', // Use backend message or default
          extractedFrames: extractedFrames, // This comes from your frontend logic
          overallPrediction: result.result.overall_prediction, // Directly uses backend's string prediction
          fakePercentage: result.result.fake_percentage,
          fakeFramesCount: result.fake_frames, // Corrected: ensure this directly matches 'fake_frames' if needed
          totalFrames: result.result.total_frames,
          processingInfo: result.processing_info,
          filename: result.filename, // Also pass the filename for display
          videoFiles:videoFile,
          FACK_A:FRAMESS
        });

        
        
        

        
        
        

        // console.log("result.result.overall_prediction  - ",result.result.overall_prediction);
        // console.log("processedVideoUrl :: ",processedVideoUrl);
        // console.log("selectedModel -- ",selectedModel);
        // console.log("frameRate :: ",frameRate);
        // console.log("result.message )) ",result.message);
        // console.log("extractedFrames ]] ",extractedFrames);
        // console.log("result.result.fake_percentage >> ",result.result.fake_percentage);
        // console.log("result.result.total_frames  // ",result.result.total_frames);
        // console.log("result.processing_info  ?? ",result.processing_info);
        // console.log("result.filename << ",result.filename);

        
        
      } catch (error) {
        console.error('Error during prediction:', error);
        setPredictionError(`Prediction failed: ${error.message}. Please try again.`);
        showCustomAlert(`Prediction failed: ${error.message}. Please try again.`);
      } finally {
        console.log("pred:  ",predictionResult);
        setIsLoading(false);
        setTriggerPrediction(false); // Reset trigger
        // Revoke the local object URL after processing or failure
        if (videoURL) {
          URL.revokeObjectURL(videoURL);
          setVideoURL(null); // Clear the local preview URL
        }
      }
    };

    performPrediction();
  }, [triggerPrediction, videoFile, selectedModel, frameRate, maxFrames, extractFrames, videoURL]); // Removed navigate from here, navigation is in a separate useEffect

  // This useEffect navigates when predictionResult is available
  useEffect(() => {
    if (predictionResult) {
      navigate('/main/video-result', {
        state: predictionResult,
      });
    }
  }, [predictionResult, navigate]);

  // Handler to initiate the prediction process (sets the trigger)
  const handlePredict = () => {
    if (!videoFile) {
      showCustomAlert('Please upload a video first.');
      return;
    }
    setTriggerPrediction(true); // Set state to true to trigger the useEffect
  };

  const showCustomAlert = (message) => {
    console.warn("Custom Alert:", message);
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-out';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      document.body.removeChild(alertDiv);
    }, 3000);
  };

  // Cleanup for the local videoURL if component unmounts prematurely
  useEffect(() => {
    return () => {
      if (videoURL) {
        URL.revokeObjectURL(videoURL);
      }
    };
  }, [videoURL]);


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-white font-sans antialiased">
      <div
        className="flex flex-col items-center justify-center px-4 py-12 flex-grow"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse-light">
          Video Deepfake Detection
        </h1>

        <div
          className="w-full max-w-2xl border-4 border-dashed border-gray-600 rounded-3xl p-12 text-center bg-gray-800/60 backdrop-blur-sm shadow-xl transition-all duration-300 ease-in-out hover:border-blue-500 hover:shadow-2xl cursor-pointer flex flex-col items-center justify-center min-h-[250px]"
          onClick={isLoading || isExtractingFrames ? null : handleClick} // Disable click when loading/extracting
          onDragOver={handleDragOver}
          onDrop={handleDrop}
         >
          {videoFile ? (
            <p className="text-xl font-semibold text-green-400 flex items-center">
              <svg className="h-7 w-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Video Selected: <span className="font-bold text-white ml-1">{videoFile.name}</span>
            </p>
          ) : (
            <>
              <svg className="w-16 h-16 text-gray-400 mb-4 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="text-2xl font-bold mb-3 text-gray-200">
                Drag & Drop or <span className="text-blue-400 hover:text-blue-300 underline">Browse Video</span>
              </p>
              <p className="text-md text-gray-400">
                Supported formats: .mp4, .webm
              </p>
            </>
          )}
          <input
            type="file"
            accept=".mp4,.webm"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {videoURL && (
          <div className="mt-10 w-full max-w-3xl p-6 bg-gray-800/70 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
            <p className="text-2xl font-bold mb-4 text-blue-300">Video Preview</p>
            <video
              src={videoURL}
              controls
              className="w-full h-auto rounded-lg shadow-lg border border-gray-600"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}

        {predictionError && (
          <div className="mt-8 p-4 rounded-lg text-center font-semibold text-lg bg-red-700 text-white animate-fade-in-out">
            {predictionError}
          </div>
        )}

        {(isLoading || isExtractingFrames) && (
          <div className="text-white mt-10 text-2xl flex items-center bg-blue-600 px-6 py-3 rounded-full shadow-lg animate-pulse">
            <svg className="animate-spin -ml-1 mr-4 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isExtractingFrames ? 'Extracting frames from video...' : 'Analyzing video... Please wait.'}
          </div>
        )}
      </div>

      <VideoFooter
        videoFile={videoFile}
        onPredict={handlePredict}
        onModelSelect={handleModelSelect}
        onFrameRateChange={handleFrameRateChange}
        selectedModel={selectedModel}
        selectedFrameRate={frameRate}
        isLoading={isLoading || isExtractingFrames}
      />
    </div>
  );
}

export default VideoPage;