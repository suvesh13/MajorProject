import React from 'react';
import { Link } from 'react-router-dom';
import backgroundI from '../../public/Image/bgII.jpg';

function Start() {
  return (
    <div className="relative h-screen w-full overflow-hidden text-white">
      {
        console.log(backgroundI)

      }
      <img
        src={backgroundI}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 flex flex-col justify-center items-start h-full p-10 md:p-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
          Deep Fake Face Detection using Artificial Intelligence
        </h1>
        <Link to="/abstact">
          <button className="mt-4 px-6 py-2 border border-white rounded-full text-white hover:bg-white hover:text-black transition">
            ABSTRACT
          </button>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Link to="/main/home">
          <button className="bg-gray-800 hover:bg-gray-600 px-5 py-2 rounded text-white shadow-lg transition">
            Analysis
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Start;
