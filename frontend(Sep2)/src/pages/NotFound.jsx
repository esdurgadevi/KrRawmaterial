import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      
      {/* Icon */}
      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
        <span className="text-white text-2xl font-bold">!</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        404 - Page Not Found
      </h1>

      {/* Description */}
      <p className="text-gray-600 text-center mb-6 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Go Back
        </button>

        <Link
          to="/"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;