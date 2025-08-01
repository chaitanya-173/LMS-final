import React from "react";
import { Home, Book, PlusCircle, Users, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    label: "Dashboard",
    icon: <Home size={18} />,
    path: "/instructor/dashboard",
  },
  {
    label: "My Courses",
    icon: <Book size={18} />,
    path: "/instructor/courses",
  },
  {
    label: "Create Course",
    icon: <PlusCircle size={18} />,
    path: "/instructor/create-course",
  },
  {
    label: "Student Activity",
    icon: <Users size={18} />,
    path: "/instructor/students",
  },
];

const InstructorSidebar = () => {
  const { logoutUser } = useAuth();

  return (
    <aside className="w-64 bg-[#1f1d1b] text-gray-300 h-screen flex flex-col justify-between fixed left-0 top-0 border-r border-[#2a2826] shadow-lg">
      {/* TOP LOGO */}
      <div>
        <div className="h-[60px] px-5 flex items-center gap-3 border-b border-[#2a2826]">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded" />
          <h1 className="text-lg font-semibold text-white tracking-wide">
            L.M.S
          </h1>
        </div>

        {/* MENU ITEMS */}
        <nav className="mt-5 flex flex-col gap-1">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2 text-sm font-medium tracking-wide transition-colors duration-200
                 ${
                   isActive
                     ? "bg-[#f35e33] text-white"
                     : "hover:bg-[#2d2c29] hover:text-white"
                 }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* LOGOUT */}
      <div className="p-4 border-t border-[#2a2826]">
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md bg-[#2b2927] hover:bg-[#3c3a38] text-sm transition-colors duration-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default InstructorSidebar;
