import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#111] text-white px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 text-orange-500">Welcome to My LMS</h1>
      <p className="text-lg text-gray-300 mb-6">
        Learn, grow, and master skills at your own pace.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded text-white font-semibold transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="border border-orange-500 hover:bg-orange-500 px-6 py-3 rounded text-white font-semibold transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
