// components/VideoPage.jsx
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoFooter from '../Footer/VideoFooter';

function VideoPage() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoURL(URL.createObjectURL(file));
    } else {
      alert('Please select a valid video file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoURL(URL.createObjectURL(file));
    } else {
      alert('Please upload a valid video file.');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handlePredict = () => {
    if (!videoFile) {
      alert('Please upload a video first.');
      return;
    }

    const simulatedResult = {
      isReal: Math.random() > 0.5,
      videoURL,
    };

    navigate('/main/video-result', { state: simulatedResult });
  };

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center px-6"
        style={{ height: '65vh' }}
      >
        <div
          className="w-full max-w-xl border-4 border-dashed rounded-2xl p-10 text-center bg-gray-900 text-white cursor-pointer"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <p className="text-xl font-semibold mb-4">
            Click or Drag and Drop the Video
          </p>
          <p className="text-sm text-gray-300">
            Supported formats: .mp4, .webm
          </p>
          <input
            type="file"
            accept=".mp4,.webm"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {videoURL && (
          <div className="mt-6">
            <p className="text-white mb-2">Preview:</p>
            <video
              src={videoURL}
              controls
              className="max-w-md rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>

      <VideoFooter onPredict={handlePredict} />
    </div>
  );
}

export default VideoPage;
