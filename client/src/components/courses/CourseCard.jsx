import React from "react";
import { Star, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCourse } from "@/context/CourseContext";
import "./courseCard.css";

const CourseCard = ({ course }) => {
  const isDraft = course.status !== "published";
  const navigate = useNavigate();
  const { isUserEnrolledInCourse } = useCourse();

  const handleClick = () => {
    if (isUserEnrolledInCourse(course._id)) {
      navigate(`/course-overview/${course._id}`);
    } else {
      navigate(`/courses/${course._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`block group cursor-pointer`}
    >
      <div
        className={`relative w-full max-w-sm p-3 rounded-md border transition-all duration-500 overflow-hidden shadow-md
        ${
          isDraft
            ? "bg-[#181a1b] border-[#353a3c] text-gray-400"
            : "bg-[#181a1b] border-[#353a3c] text-white"
        }
        hover:scale-[1.015] hover:border-[#3a9aed] hover:shadow-[0_0_15px_#1f6feb60]`}
      >
        {/* 🔳 Thumbnail */}
        <div className="overflow-hidden rounded-md">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className={`w-full h-44 object-cover rounded-md transition-transform duration-500 group-hover:scale-105 ${
              isDraft ? "grayscale" : ""
            }`}
          />
        </div>

        {/* 📘 Title */}
        <h2 className="mt-3 text-[18.5px] font-bold leading-snug">
          {course.title}
        </h2>

        {/* 👨‍🏫 Instructor */}
        {course.instructorName && (
          <p className="text-sm text-gray-400 mt-1">
            by {course.instructorName}
          </p>
        )}

        {/* ⭐ Rating */}
        <div className="flex items-center text-sm mt-1">
          <span className="text-yellow-400 flex items-center gap-1">
            <Star size={16} fill="currentColor" />
            {course.rating || "4.5"}
          </span>
          <span className="ml-2 text-gray-400">
            ({course.ratingCount || "1000+"})
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#2e2f30] my-3"></div>

        {/* 💰 Pricing + Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-medium">
            <span>₹{course.pricing || "Free"}</span>

            {course.originalPrice && (
              <span className="line-through text-sm text-gray-500">
                ₹{course.originalPrice}
              </span>
            )}

            {course.discount && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                {course.discount}% off
              </span>
            )}
          </div>

          {/* 🚫 Draft/Expired Badge */}
          {isDraft && (
            <div className="flex items-center gap-1 text-xs bg-red-600 bg-opacity-90 text-white px-2 py-1 rounded-md">
              <AlertCircle size={14} /> Expired
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
