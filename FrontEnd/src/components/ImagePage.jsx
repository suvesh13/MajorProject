import React, { useRef, useState } from 'react';

function ImagePage() {
  const inputRef = useRef(null);
  const [highlight, setHighlight] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setHighlight(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setHighlight(true);
  };

  const handleDragLeave = () => {
    setHighlight(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
    } else {
      alert('Please select a valid image file.');
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{ height: '65vh' }}
    >
      <div
        className={`w-full max-w-xl border-4 border-dashed rounded-2xl p-10 text-center bg-gray-900 text-white cursor-pointer transition ${
          highlight ? 'border-blue-500' : 'border-gray-500'
        }`}
        onClick={handleClick}
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

      {imageURL && (
        <div className="mt-6">
          <p className="text-white mb-2">Preview:</p>
          <img
            src={imageURL}
            alt="Preview"
            className="max-w-md rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}

export default ImagePage;
