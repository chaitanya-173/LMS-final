import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PageNotFound = () => {
  const { user } = useAuth();

  let redirectPath = "/";
  if (user?.role === "student") redirectPath = "/home";
  else if (user?.role === "instructor") redirectPath = "/home";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#111] text-white px-4 text-center">
      <h1 className="text-6xl font-bold mb-4 text-orange-500">404</h1>
      <p className="text-xl mb-6">Oops! The page you're looking for doesn't exist.</p>
      <Link
        to={redirectPath}
        className="bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default PageNotFound;
