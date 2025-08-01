import React from "react";
import { ChevronDown, ChevronRight, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CoursePlayerSidebar = ({
  course,
  chapters,
  flatLectures,
  selectedLecture,
  openChapters,
  toggleChapter,
  courseId,
  getProgressForLecture,
  setHasSeekedOnce,
  loading,
}) => {
  const navigate = useNavigate();

  const totalLessons = course?.hasDirectLectures
    ? flatLectures.length
    : chapters.reduce((acc, ch) => acc + (ch.lectures?.length || 0), 0);

  return (
    <div className="w-[300px] bg-[#181818] p-4 border-r border-[#2a2a2a] overflow-y-auto min-h-screen">
      {/* Title & progress */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold truncate w-[180px]">
          {loading ? "Loading..." : course?.title || "Course Title"}
        </h2>
        <span className="text-xs text-gray-500">0/{totalLessons} lessons</span>
      </div>
      <div className="mb-5">
        <div className="w-full bg-[#2e2e2e] h-2 rounded-full">
          <div
            className="bg-pink-500 h-2 rounded-full"
            style={{ width: "0%" }} // TODO: progress % calculation
          />
        </div>
        <p className="text-[11px] text-gray-500 mt-1">0% complete</p>
      </div>

      {/* Lectures or Chapters */}
      {course?.hasDirectLectures ? (
        <div className="space-y-2">
          {flatLectures.map((lecture) => {
            const percent = getProgressForLecture(lecture._id);
            return (
              <div
                key={lecture._id}
                onClick={() => {
                  navigate(
                    `/my-courses/${courseId}/player?lectureId=${lecture._id}`
                  );
                  setHasSeekedOnce(false);
                }}
                className={`cursor-pointer px-3 py-2 border border-[#2d2d2d] bg-[#1e1e1e] text-sm rounded-md ${
                  selectedLecture?._id === lecture._id
                    ? "bg-[#3d3d3d] text-orange-400"
                    : "hover:bg-[#2e2e2e]"
                } flex flex-col gap-1`}
              >
                <div className="flex items-center gap-2">
                  <PlayCircle size={16} />
                  <span className="truncate">{lecture.title}</span>
                </div>
                <div className="w-full h-[3px] bg-[#3b3b3b] rounded overflow-hidden mt-1">
                  <div
                    className="bg-orange-400 h-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <div key={chapter._id}>
              <button
                onClick={() => toggleChapter(index)}
                className="flex justify-between items-center w-full px-3 py-2 border border-[#2d2d2d] bg-[#1e1e1e] rounded-md text-left text-sm hover:bg-[#2c2c2c]"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {index + 1}: {chapter.title}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {chapter.lectures.length}{" "}
                    {chapter.lectures.length === 1 ? "lesson" : "lessons"}
                  </span>
                </div>
                {openChapters.includes(index) ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {openChapters.includes(index) && (
                <ul className="mt-2 ml-2 pl-2 border-l border-gray-700 space-y-1">
                  {chapter.lectures?.map((lecture) => {
                    const percent = getProgressForLecture(lecture._id);
                    return (
                      <li
                        key={lecture._id}
                        onClick={() => {
                          navigate(
                            `/my-courses/${courseId}/player?lectureId=${lecture._id}`
                          );
                          setHasSeekedOnce(false);
                        }}
                        className={`cursor-pointer px-2 py-1 rounded flex flex-col gap-1 text-sm ${
                          selectedLecture?._id === lecture._id
                            ? "bg-[#3d3d3d] text-orange-400"
                            : "hover:bg-[#2e2e2e]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <PlayCircle size={16} />
                          <span>{lecture.title}</span>
                        </div>
                        <div className="w-full h-[3px] bg-[#3b3b3b] rounded overflow-hidden">
                          <div
                            className="bg-orange-400 h-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursePlayerSidebar;
