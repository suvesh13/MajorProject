import { Link } from 'react-router-dom';

function Header() {
  return (
   <div className="w-full bg-gray-400 p-4 shadow-md">
  <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* left */}
        <div>
         <Link to="/">
           <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Deepfake Studio
          </button>
         </Link>
        </div>

        {/* Right side */}
        <div className="space-x-4">
          <Link to="image">
            <button className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-900">
              Image Detection
            </button>
          </Link>
          <Link to="video">
            <button className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-900">
              Video Detection
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
