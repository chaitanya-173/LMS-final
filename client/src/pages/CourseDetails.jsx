import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "@/context/CourseContext";
import Loader from "@/components/Loader";
import { Star, Users, Globe, ChevronDown, ChevronRight } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const CourseDetails = () => {
  const { user, token } = useAuth();
  const [openChapters, setOpenChapters] = useState({});
  const [lectureCount, setLectureCount] = useState(0);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { enrollInCourse } = useCourse();
  const {
    fetchCourseDetails,
    fetchChaptersForCourse,
    fetchLecturesForCourse,
    currentCourseDetails: course,
    currentCourseChapters: chapters,
    currentCourseLectures: lectures,
    loading,
    fetchLectureCount,
  } = useCourse();

  useEffect(() => {
    if (courseId) fetchCourseDetails(courseId);
  }, [courseId]);

  useEffect(() => {
    if (
      course &&
      !course.hasDirectLectures &&
      course._id // make sure courseId is available
    ) {
      fetchChaptersForCourse(course._id);
    }
  }, [course]);

  useEffect(() => {
    if (course?.hasDirectLectures === true && course?._id) {
      fetchLecturesForCourse(course._id);
    }
  }, [course]);

  useEffect(() => {
    if (course) {
      fetchLectureCount(course).then(setLectureCount);
    }
  }, [course]);

  const handleEnrollOrBuy = async () => {
    // 🔐 If not logged in, redirect to login
    if (!user || !token) {
      toast.error("Please login first to enroll or buy.");
      return navigate("/login");
    }

    if (course.pricing === 0 || course.pricing === "Free") {
      try {
        await enrollInCourse(course._id); // API + toast
        navigate(`/my-courses`); // redirect after enroll
      } catch (err) {
        // already handled inside context
      }
    } else {
      navigate(`/buy/${course._id}`);
    }
  };

  if (loading || !course) return <Loader />;

  if (course.status !== "published") {
    return (
      <DashboardLayout>
        <div className="text-red-500 text-center mt-10">
          This course is not available.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-10 text-white">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-2 text-white">
              {course.title}
            </h1>
            <p className="text-base text-gray-400 mb-4">
              by {course.instructorName}
            </p>

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

            <h2 className="text-2xl font-semibold mb-3 text-white">
              About Course
            </h2>
            <div className="text-gray-300 leading-relaxed text-[15px] mb-8 space-y-4">
              {course.description.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

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
          </div>

          {/* RIGHT CARD */}
          <div className="md:w-1/3">
            <div className="group sticky top-24 w-full p-3 rounded-md border border-[#353a3c] bg-[#181a1b] text-white shadow-md transition-all duration-500 hover:shadow-[0_0_15px_#1f6feb60] hover:border-[#3a9aed] hover:scale-[1.015]">
              <div className="overflow-hidden rounded-md mb-4">
                <img
                  src={course.thumbnailUrl}
                  alt="Course thumbnail"
                  className="rounded-md w-full h-44 object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  {course.pricing === 0 || course.pricing === "Free" ? (
                    <span className="text-green-500">Free</span>
                  ) : (
                    <>
                      <span>₹{course.pricing}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{course.originalPrice}
                        </span>
                      )}
                      {course.discount && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                          {course.discount}% off
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-[#2e2f30] my-3" />

              <div className="text-sm text-gray-300 space-y-2 mb-5">
                <p>⏱ 150+ hours of content</p>
                <p>🎬 {lectureCount} Lectures</p>
              </div>

              <button
                onClick={handleEnrollOrBuy}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-md w-full font-medium"
              >
                {course.pricing === 0 || course.pricing === "Free"
                  ? "Enroll Now"
                  : "Buy Now"}
              </button>
            </div>
          </div>
        </div>

        {/* COURSE CURRICULUM */}
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
    </DashboardLayout>
  );
};

export default CourseDetails;
