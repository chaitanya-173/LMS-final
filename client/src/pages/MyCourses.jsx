import React, { useState } from "react";
import { useCourse } from "@/context/CourseContext";
import CourseCard from "@/components/courses/CourseCard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Search } from "lucide-react";

const MyCourses = () => {
  const { enrolledCourses } = useCourse();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = enrolledCourses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen">
        {/* 🔰 Heading + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-white">My Courses</h1>

          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181a1b] text-white border border-[#353a3c] rounded-md pl-10 pr-4 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
        </div>

        {/* 🧠 Courses List */}
        {filteredCourses.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">
            No matching courses found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
