function ImageFooter({ onPredict }) {
  return (
    <div className="w-full bg-gray-400 p-4 shadow-md mt-auto">
      {/* Model Buttons */}
      <div className="flex flex-wrap justify-center gap-10">
        <button className="bg-gray-800 text-white px-6 py-2 rounded-xl shadow hover:bg-gray-600 transition">
          Linear Model
        </button>
        <button className="bg-gray-800 text-white px-6 py-2 rounded-xl shadow hover:bg-gray-600 transition">
          SVM Model
        </button>
        <button className="bg-gray-800 text-white px-6 py-2 rounded-xl shadow hover:bg-gray-600 transition">
          KNN Model
        </button>
      </div>

      {/* Predict Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={onPredict}
          className="bg-blue-600 text-white px-8 py-2 rounded-xl shadow hover:bg-blue-800 transition"
        >
          Predict
        </button>
      </div>
    </div>
  );
}

export default ImageFooter;
