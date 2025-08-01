import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  // Initialize state from localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("mainSidebarCollapsed")) || false
  );
  const [isCourseSidebarCollapsed, setIsCourseSidebarCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("courseSidebarCollapsed")) || false
  );

  // Main sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("mainSidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  // Course sidebar toggle
  const toggleCourseSidebar = () => {
    setIsCourseSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("courseSidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  // Keep localStorage synced (in case state changes elsewhere)
  useEffect(() => {
    localStorage.setItem("mainSidebarCollapsed", JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("courseSidebarCollapsed", JSON.stringify(isCourseSidebarCollapsed));
  }, [isCourseSidebarCollapsed]);

  // Identify which sidebar to use
  const isCourseDetailsPage = location.pathname.startsWith("/courses/");

  const currentSidebarCollapsed = isCourseDetailsPage
    ? isCourseSidebarCollapsed
    : isSidebarCollapsed;

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      {/* Sidebar */}
      <Sidebar isCollapsed={currentSidebarCollapsed} />

      {/* Right Content Area */}
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ${
          currentSidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        {/* Navbar */}
        <Navbar
          onSidebarToggle={toggleSidebar}
          onCourseSidebarToggle={toggleCourseSidebar}
          isSidebarCollapsed={currentSidebarCollapsed}
        />

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
