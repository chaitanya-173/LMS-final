import React from "react";
import { useAuth } from "@/context/AuthContext";

const InstructorDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.userName}</h1>
      <p className="text-gray-300">This is your Instructor Dashboard.</p>
    </div>
  );
};

export default InstructorDashboard;
