// src/components/course/CourseAllContents.jsx
import React from "react";
import LectureCard from "@/components/lectures/LectureCard";

const CourseAllContents = ({
  isChapterBased,
  chaptersWithLectures,
  flatLectures,
  currentCourseDetails,
  navigate,
  courseId,
  openAttachments
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">
        {currentCourseDetails?.title || "All Contents"}
      </h2>

      {isChapterBased ? (
        chaptersWithLectures.map((ch, index) => (
          <div key={ch._id} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {index + 1}. {ch.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {ch.lectures.map((lec) => (
                <LectureCard
                  key={lec._id}
                  lecture={{
                    ...lec,
                    uploadDate: lec.createdAt,
                    duration: lec.duration || "12:45",
                  }}
                  progress={0}
                  onPlay={() =>
                    navigate(`/my-courses/${courseId}/player?lectureId=${lec._id}`)
                  }
                  onAttachments={() => openAttachments(lec)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {flatLectures.map((lec) => (
            <LectureCard
              key={lec._id}
              lecture={{
                ...lec,
                uploadDate: lec.createdAt,
                duration: lec.duration || "12:45",
              }}
              progress={0}
              onPlay={() =>
                navigate(`/my-courses/${courseId}/player?lectureId=${lec._id}`)
              }
              onAttachments={() => openAttachments(lec)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CourseAllContents;
