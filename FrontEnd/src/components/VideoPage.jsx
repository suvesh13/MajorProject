import React, { useState, useRef } from 'react';

function VideoPage() {
  const [videoFile, setVideoFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    }
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6"
      style={{ height: '65vh' }}
    >
      <div
        className="w-full max-w-xl border-4 border-dashed border-gray-500 rounded-2xl p-10 text-center bg-gray-900 text-white cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <p className="text-xl font-semibold mb-4">
          Click or Drag and Drop the Video
        </p>
        <p className="text-sm text-gray-300">
          Supported formats: .mp4, .avi, .mov
        </p>
        <input
          type="file"
          accept="video/mp4,video/x-m4v,video/*"
          className="hidden"
          ref={inputRef}
          onChange={handleFileChange}
        />
      </div>

      {videoFile && (
        <div className="mt-6">
          <p className="text-white mb-2">Preview:</p>
          <video controls width="400">
            <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export default VideoPage;
