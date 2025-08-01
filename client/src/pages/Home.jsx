import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.userName}</h1>
      <p className="mb-6 text-gray-700">
        You are logged in as <strong>{user?.role}</strong>
      </p>

      {user?.role === "instructor" && (
        <button
          onClick={() => navigate("/home")}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Go to Instructor Dashboard
        </button>
      )}

      <button
        onClick={logoutUser}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
      >
        Logout
      </button>
    </DashboardLayout>
  );
};

export default Home;
