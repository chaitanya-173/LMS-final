import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useCourse } from "@/context/CourseContext";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LectureVideoPlayer from "@/components/player/LectureVideoPlayer";
import CoursePlayerSidebar from "@/components/player/CoursePlayerSidebar";
import LectureResourceTabs from "@/components/player/LectureResourceTabs";

const MyCoursePlayer = () => {
  const [openChapters, setOpenChapters] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [flatLectures, setFlatLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lectureProgressList, setLectureProgressList] = useState([]);
  const [hasSeekedOnce, setHasSeekedOnce] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);

  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const lectureId = searchParams.get("lectureId");
  const { token } = useAuth();

  const {
    fetchCourseDetails,
    currentCourseDetails,
    fetchLecturesForCourse,
    fetchChaptersForCourse,
    fetchLecturesByChapter,
    fetchLectureById,
  } = useCourse();

  useEffect(() => {
    const fetchLectureProgress = async () => {
      try {
        const res = await fetch(`/api/student/progress/course/${courseId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setLectureProgressList(data.progress || []);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };

    if (courseId) fetchLectureProgress();
  }, [courseId, token]);

  const getProgressForLecture = (lectureId) => {
    const match = lectureProgressList.find((p) => p.lectureId === lectureId);
    if (!match || !match.duration) return 0;
    return Math.min(100, Math.floor((match.watchTime / match.duration) * 100));
  };

  useEffect(() => {
    if (courseId) fetchCourseDetails(courseId);
  }, [courseId]);

  useEffect(() => {
    const loadContent = async () => {
      if (!currentCourseDetails) return;
      setLoading(true);

      try {
        if (currentCourseDetails.hasDirectLectures) {
          const res = await fetchLecturesForCourse(courseId);
          setFlatLectures(res || []);
          const found = res.find((lec) => lec._id === lectureId);
          setSelectedLecture(found || res[0] || null);
        } else {
          const fetchedChapters = await fetchChaptersForCourse(courseId);
          const withLectures = await Promise.all(
            fetchedChapters.map(async (ch) => {
              const lectures = await fetchLecturesByChapter(ch._id);
              return { ...ch, lectures: lectures || [] };
            })
          );
          setChapters(withLectures);

          let found = null;
          for (let chapter of withLectures) {
            const match = chapter.lectures.find((lec) => lec._id === lectureId);
            if (match) {
              found = match;
              break;
            }
          }

          if (found) setSelectedLecture(found);
          else if (withLectures[0]?.lectures[0])
            setSelectedLecture(withLectures[0].lectures[0]);
        }
      } catch (err) {
        console.error("Error loading content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [currentCourseDetails, lectureId]);

  useEffect(() => {
    const loadLecture = async () => {
      if (!lectureId) return;
      const data = await fetchLectureById(lectureId);
      setCurrentLecture(data);
    };

    loadLecture();
  }, [lectureId, fetchLectureById]);

  const toggleChapter = (index) => {
    setOpenChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const saveLectureProgress = async (lectureId, watchTime, duration) => {
    try {
      await fetch("/api/student/progress/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, lectureId, watchTime, duration }),
      });

      setLectureProgressList((prev) => {
        const existingIndex = prev.findIndex((p) => p.lectureId === lectureId);
        const updated = { lectureId, watchTime, duration };
        if (existingIndex !== -1) {
          const copy = [...prev];
          copy[existingIndex] = updated;
          return copy;
        } else {
          return [...prev, updated];
        }
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  // 🔽 Return block
  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <CoursePlayerSidebar
          course={currentCourseDetails}
          chapters={chapters}
          flatLectures={flatLectures}
          selectedLecture={selectedLecture}
          openChapters={openChapters}
          toggleChapter={toggleChapter}
          courseId={courseId}
          getProgressForLecture={getProgressForLecture}
          setHasSeekedOnce={setHasSeekedOnce}
          loading={loading}
        />

        {/* Video + Tabs */}
        <div className="flex-1 p-6">
          <LectureVideoPlayer
            lecture={selectedLecture}
            initialWatchTime={
              lectureProgressList.find(
                (p) => p.lectureId === selectedLecture?._id
              )?.watchTime || 0
            }
            onProgress={(watchTime, duration) =>
              saveLectureProgress(selectedLecture._id, watchTime, duration)
            }
          />

          {/* Title + Tabs */}
          {selectedLecture?.title && (
            <>
              <hr className="my-4 border-gray-700" />
              <h3 className="text-xl font-semibold">{selectedLecture.title}</h3>
              <LectureResourceTabs lecture={selectedLecture} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCoursePlayer;
