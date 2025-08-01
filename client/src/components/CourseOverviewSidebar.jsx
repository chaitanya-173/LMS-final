import React from "react";
import {
  Book,
  LayoutList,
  FileText,
  FileCheck2,
  ListChecks,
} from "lucide-react";

const tabs = [
  { key: "overview", label: "Overview", icon: <Book size={18} /> },
  { key: "chapters", label: "All Contents", icon: <LayoutList size={18} /> },
  { key: "notes", label: "Notes", icon: <FileText size={18} /> },
  { key: "assignments", label: "Assignments", icon: <FileCheck2 size={18} /> },
  { key: "quizzes", label: "Quizzes", icon: <ListChecks size={18} /> },
];

const CourseOverviewSidebar = ({ activeTab, setActiveTab, isCollapsed }) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col 
        ${isCollapsed ? "w-16" : "w-60"} 
        bg-[#181818] text-white border-r border-[#2a2a2a] 
        transition-all duration-300`}
    >
      {/* Top Section */}
      <div className="flex items-center px-4 py-4 border-b border-[#2a2a2a]">
        <img src="/logo.png" alt="Logo" className="h-7 w-7 mr-2" />
        {!isCollapsed && (
          <span className="text-lg font-semibold text-white">Codemy</span>
        )}
      </div>

      {/* Course Menu Heading */}
      <div className="px-4 mt-4 mb-2">
        {!isCollapsed && (
          <h2 className="text-sm uppercase tracking-wide text-gray-400 font-medium">
            Course Menu
          </h2>
        )}
      </div>

      {/* Tabs */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-3 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            title={isCollapsed ? tab.label : ""} // Tooltip jab collapsed hai
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-3 px-3 py-2 w-full rounded-md transition-all duration-200 
              ${
                activeTab === tab.key
                  ? "bg-[#3a9aed] text-white font-medium shadow"
                  : "text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
              }`}
          >
            {tab.icon}
            {!isCollapsed && <span>{tab.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default CourseOverviewSidebar;
