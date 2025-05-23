import React from 'react';

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-full max-w-xl border-4 border-dashed border-gray-500 rounded-2xl p-10 text-center bg-gray-900 text-white">
        <p className="text-xl font-semibold mb-4">
         Welcome to deepfake studio one stop destination for you to detect ai generated  digital content 
        </p>
        <p className="text-sm text-gray-300">
          Supported formats: .mp4, .avi, .mov
        </p>
      </div>
    </div>
  );
}

export default HomePage;
