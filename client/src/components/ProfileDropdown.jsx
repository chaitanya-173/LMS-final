import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut, Settings } from "lucide-react";

const ProfileDropdown = () => {
  const { user, logoutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar */}
      <img
        src={user.imageUrl || "/default-avatar.png"}
        alt="Profile"
        onClick={toggleDropdown}
        className="w-9 h-9 rounded-full border-2 border-white cursor-pointer object-cover"
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1e1e1e] text-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="p-4 flex flex-col items-center border-b border-gray-700">
            <img
              src={user.imageUrl || "/default-avatar.png"}
              alt="User"
              className="w-14 h-14 rounded-full object-cover"
            />
            <h3 className="mt-2 text-lg font-semibold">{user.userName}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          {/* Menu */}
          <div className="flex flex-col px-4 py-3 text-sm space-y-3">
            <button
              onClick={() => {
                navigate("/profile");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 hover:text-orange-400"
            >
              <User size={16} /> Profile
            </button>

            <button
              onClick={() => {
                navigate("/edit-profile");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 hover:text-orange-400"
            >
              <Settings size={16} /> Edit Profile
            </button>

            <hr className="border-gray-600" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-400"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
