import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Sidebar = ({ isCollapsed }) => {
  const { pathname } = useLocation();
  const { logoutUser } = useAuth();

  const isActive = (path) => pathname === path;

  const commonLinkClasses =
    "flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-200";

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col justify-between ${
        isCollapsed ? "w-16" : "w-60"
      } bg-[#1e1e1e] text-white transition-all duration-300`}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className="flex items-center px-4 py-4 border-b border-gray-700">
          <img src="/logo.png" alt="Logo" className="h-7 w-7 mr-2" />
          {!isCollapsed && (
            <span className="text-lg font-semibold text-white">Codemy</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4 space-y-3 px-2">
          <Link
            to="/home"
            className={`${commonLinkClasses} ${
              isActive("/home")
                ? "bg-zinc-800 text-orange-500"
                : "hover:bg-zinc-800"
            }`}
          >
            <Home className="h-6 w-6" />
            {!isCollapsed && <span>Home</span>}
          </Link>

          <Link
            to="/all-courses"
            className={`${commonLinkClasses} ${
              isActive("/all-courses")
                ? "bg-zinc-800 text-orange-500"
                : "hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="h-6 w-6" />
            {!isCollapsed && <span>All Courses</span>}
          </Link>

          <Link
            to="/my-courses"
            className={`${commonLinkClasses} ${
              isActive("/my-courses")
                ? "bg-zinc-800 text-orange-500"
                : "hover:bg-zinc-800"
            }`}
          >
            <GraduationCap className="h-6 w-6" />
            {!isCollapsed && <span>My Courses</span>}
          </Link>
        </nav>
      </div>

      {/* Bottom Logout */}
      <div className="px-2 py-4 border-t border-gray-700">
        <button
          onClick={logoutUser}
          className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm hover:bg-zinc-800 transition-all duration-200 w-full"
        >
          <LogOut className="h-6 w-6 text-red-500" />
          {!isCollapsed && (
            <span className="text-red-500">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
