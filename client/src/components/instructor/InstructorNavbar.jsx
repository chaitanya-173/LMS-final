import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import ProfileDropdown from "../ProfileDropdown";
import { useAuth } from "@/context/AuthContext";

const InstructorNavbar = ({ theme, toggleTheme }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitleMap = {
    "/instructor/dashboard": "Dashboard",
    "/instructor/courses": "My Courses",
    "/instructor/create-course": "Create Course",
    "/instructor/students": "Student Activity",
  };

  const pageTitle = pageTitleMap[location.pathname] || "Instructor Panel";

  return (
    <header className="w-full h-[60px] bg-[#252523] text-white flex items-center justify-between px-5 border-b border-[#2e2e2c] shadow-sm">
      {/* LEFT - Page Title */}
      <h1 className="text-lg font-semibold tracking-wide">{pageTitle}</h1>

      {/* RIGHT - Controls */}
      <div className="flex items-center gap-3">
        {/* Go to Student Area */}
        <button
          onClick={() => navigate("/home")}
          className="text-sm bg-[#32312e] hover:bg-[#3a3936] px-3 py-1.5 rounded-md transition-colors duration-200"
        >
          Student Area
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-[#3a3936] transition-colors duration-200"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile Dropdown */}
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
};

export default InstructorNavbar;
