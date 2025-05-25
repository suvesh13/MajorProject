import React from 'react';

function Footer() {
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

      {/* Predict and Frame Rate Section */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
        {/* Frame Rate Dropdown */}
        <div className="flex items-center">
          <label htmlFor="frameRate" className="mr-3 text-lg font-medium">
            Frame Rate:
          </label>
          <select
            id="frameRate"
            className="bg-gray-900 text-white px-4 py-2 rounded-xl border border-gray-600 focus:outline-none"
            defaultValue="15"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="30">30</option>
          </select>
        </div>

        {/* Predict Button */}
        <button className="bg-blue-600 text-white px-8 py-2 rounded-xl shadow hover:bg-blue-800 transition">
          Predict
        </button>
      </div>
    </div>
  );
}

export default Footer;
