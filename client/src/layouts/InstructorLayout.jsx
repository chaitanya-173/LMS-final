import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import InstructorSidebar from "@/components/instructor/InstructorSidebar";
import InstructorNavbar from "@/components/instructor/InstructorNavbar";

const InstructorLayout = () => {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <div className={`flex h-screen w-screen ${theme === "dark" ? "bg-[#121212]" : "bg-gray-100"}`}>
      {/* SIDEBAR */}
      <InstructorSidebar />

      {/* MAIN AREA */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* NAVBAR */}
        <InstructorNavbar theme={theme} toggleTheme={toggleTheme} />

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-inherit">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
