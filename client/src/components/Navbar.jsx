import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Menu, X } from "lucide-react";

/**
 * Navbar
 *
 * Props:
 *  - onSidebarToggle          (fn) main app sidebar toggle
 *  - isSidebarCollapsed       (bool) state for main app sidebar
 *  - onCourseSidebarToggle    (fn) course-specific sidebar toggle (details / overview)
 *  - isCourseSidebarCollapsed (bool) state for course sidebar (optional)
 */
const Navbar = ({
  onSidebarToggle,
  isSidebarCollapsed,
  onCourseSidebarToggle,
  isCourseSidebarCollapsed = false,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

  /* ---------- Route detection ---------- */
  const isMainSidebarPage = ["/home", "/all-courses", "/my-courses"].some(
    (path) => location.pathname.startsWith(path)
  );
  const isCourseDetailsPage = location.pathname.startsWith("/courses/");
  const isCourseOverviewPage = location.pathname.includes("/course-overview");
  const isPlayerPage = location.pathname.includes("/player"); // hide toggle

  /* show/hide toggle btn */
  const showSidebarToggle =
    (isMainSidebarPage || isCourseDetailsPage || isCourseOverviewPage) &&
    !isPlayerPage;

  /* which collapse state to use for left offset */
  const collapsed = isMainSidebarPage
    ? isSidebarCollapsed
    : isCourseSidebarCollapsed;

  /* which handler to call */
  const handleSidebarToggle = () => {
    if (isMainSidebarPage) {
      onSidebarToggle?.();
    } else if (isCourseDetailsPage || isCourseOverviewPage) {
      onCourseSidebarToggle?.();
    }
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      {showSidebarToggle && (
        <button
          onClick={isMainSidebarPage ? onSidebarToggle : onCourseSidebarToggle}
          className={`fixed top-4 ${
            isMainSidebarPage
              ? isSidebarCollapsed
                ? "left-16"
                : "left-60"
              : isSidebarCollapsed
              ? "left-16"
              : "left-60"
          } z-50 bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-md transition-all duration-300`}
        >
          <Menu size={22} />
        </button>
      )}

      {/* Main Navbar */}
      <nav className="bg-[#1e1e1e] text-white px-4 py-3 h-[60px] flex items-center justify-end relative pl-20 shadow-[0_4px_18px_#2170d860]">
        <div className="flex items-center gap-4">
          {user?.role === "instructor" &&
            (location.pathname.startsWith("/instructor") ? (
              <Link
                to="/home"
                className="hidden md:inline-block text-sm font-medium text-white hover:text-orange-500 transition"
              >
                ← Back to Home
              </Link>
            ) : (
              <Link
                to="/instructor/dashboard"
                className="hidden md:inline-block text-sm font-medium text-white hover:text-orange-500 transition"
              >
                Instructor Dashboard
              </Link>
            ))}

          <div className="h-6 w-px bg-gray-600 mx-2 hidden md:block" />

          <button className="text-xl" aria-label="Toggle theme">
            🌙
          </button>

          <div className="hidden md:block">
            <ProfileDropdown />
          </div>

          {/* Mobile profile / menu */}
          <button
            className="md:hidden text-white"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
