import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { loginUser, user } = useAuth();

  // If user is already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      navigate(user.role === "instructor" ? "/instructor/dashboard" : "/home", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    loginUser({ email, password }, navigate);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white font-sans">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] max-w-6xl h-[85vh] bg-[#181818] rounded-2xl flex shadow-xl overflow-hidden">

        {/* Left Box - Form */}
        <div className="w-full md:w-1/2 px-10 py-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">Sign in</h2>
          <p className="mb-6 text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-orange-500 hover:underline">
              Sign up here
            </Link>
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              className="w-full p-3 bg-[#222] text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full p-3 bg-[#222] text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white py-3 rounded-lg font-semibold"
            >
              Sign in
            </button>
          </form>
        </div>

        {/* Right Box - Info */}
        <div className="hidden md:flex w-1/2 bg-[#1a1a1a] p-10 flex-col justify-center rounded-r-2xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our LMS</h1>
          <p className="text-gray-400 text-sm leading-6">
            Learn at your own pace. Access top courses and build your career
            with hands-on experience and assessments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
