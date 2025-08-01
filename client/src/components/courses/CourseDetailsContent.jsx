import React from "react";
import {
  Star,
  Users,
  Globe,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useCourse } from "@/context/CourseContext";

const CourseDetailsContent = ({
  lectureCount,
  openChapters,
  setOpenChapters,
}) => {
  const {
    currentCourseDetails: course,
    currentCourseChapters: chapters,
    currentCourseLectures: lectures,
  } = useCourse();

  if (!course) return null;

  return (
    <div className="text-white max-w-6xl mx-auto px-6 py-10">
      {/* ✅ Title and Instructor */}
      <h1 className="text-4xl font-bold mb-2 text-white">{course.title}</h1>
      <p className="text-base text-gray-400 mb-4">by {course.instructorName}</p>

      {/* ✅ Course Info */}
      <div className="flex flex-wrap items-center text-sm text-white gap-2 mb-6">
        <span className="flex items-center text-blue-400 font-medium">
          <Globe className="w-4 h-4 mr-1" /> {course.language || "Hindi"}
        </span>
        <span className="text-gray-500 mx-2">|</span>
        <span className="flex items-center text-orange-400 font-medium">
          <Star fill="currentColor" className="w-4 h-4 mr-1" />
          {course.rating || 4.9}
        </span>
        <span className="text-gray-500 mx-2">|</span>
        <span className="flex items-center text-purple-400 font-medium">
          <Users className="w-4 h-4 mr-1" />
          {course.students?.length || "1000+"} Learners
        </span>
      </div>

      {/* ✅ Level, Category, Tags */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 text-base text-gray-300 mb-4">
          {course.level && (
            <span>
              <strong>Level:</strong> {course.level}
            </span>
          )}
          <span className="text-gray-500">|</span>
          {course.category && (
            <span>
              <strong>Category:</strong> {course.category}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {course.tags?.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-3 py-[6px] rounded-md bg-[#1e293b] text-blue-300 border border-[#334155]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ✅ About Course */}
      <h2 className="text-2xl font-semibold mb-3 text-white">About Course</h2>
      <div className="text-gray-300 leading-relaxed text-[15px] mb-8 space-y-4">
        {course.description.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      {/* ✅ What’s Included */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">
          This Course Includes
        </h2>
        <div className="bg-[#1f1f1f] p-5 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
          {course.includes?.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              ✅ {item}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Curriculum */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Course Curriculum
        </h2>

        <div className="space-y-4">
          {course.hasDirectLectures ? (
            lectures?.length > 0 ? (
              <ul className="list-disc space-y-2 text-sm text-gray-300 ml-4">
                {lectures.map((lecture, i) => (
                  <li key={lecture._id || i}>🎬 {lecture.title}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No lectures available.</div>
            )
          ) : chapters?.length > 0 ? (
            chapters.map((chapter, index) => (
              <div
                key={chapter._id || index}
                className="bg-[#1f1f1f] rounded-md border border-[#2a2a2a]"
              >
                <div
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#262626] transition"
                  onClick={() =>
                    setOpenChapters((prev) => ({
                      ...prev,
                      [chapter._id || index]: !prev[chapter._id || index],
                    }))
                  }
                >
                  <h3 className="text-base font-medium text-white">
                    📘 {chapter.title}
                  </h3>
                  {openChapters[chapter._id || index] ? (
                    <ChevronDown className="text-gray-400" />
                  ) : (
                    <ChevronRight className="text-gray-400" />
                  )}
                </div>

                {openChapters[chapter._id || index] && (
                  <div className="px-6 pb-4 text-sm text-gray-400">
                    {chapter.description || "No description available."}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">No chapters available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsContent;
