import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "student",
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === "instructor" ? "/instructor/dashboard" : "/home", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser(formData, navigate);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white font-sans">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] max-w-6xl h-[90vh] bg-[#181818] rounded-2xl flex shadow-xl overflow-hidden">

        {/* Left Form Section */}
        <div className="w-full md:w-1/2 px-10 py-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">Sign up</h2>
          <p className="mb-6 text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 hover:underline">
              Login here
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="text"
              name="userName"
              placeholder="Enter your name"
              value={formData.userName}
              onChange={handleChange}
              required
              className="w-full p-3 bg-[#222] text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-[#222] text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 bg-[#222] text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-[#222] text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>

            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white py-3 rounded-lg font-semibold"
            >
              Sign up
            </button>
          </form>
        </div>

        {/* Right Info Section */}
        <div className="hidden md:flex w-1/2 bg-[#1a1a1a] p-10 flex-col justify-center rounded-r-2xl">
          <h1 className="text-4xl font-bold mb-4">Join Our LMS Platform</h1>
          <p className="text-gray-400 text-sm leading-6">
            Create an account to start learning, tracking your progress, and
            accessing rich content tailored to your role.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
