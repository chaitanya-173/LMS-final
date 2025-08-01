import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCourse } from "@/context/CourseContext";
import Navbar from "@/components/Navbar";
import CourseOverviewSidebar from "@/components/CourseOverviewSidebar";
import LectureAttachmentsModal from "@/components/lectures/LectureAttachmentsModal";
import CourseDetailsContent from "@/components/courses/CourseDetailsContent";
import CourseAllContents from "@/components/courses/CourseAllContents ";
import CourseNotesContent from "@/components/courses/CourseNotesContent";
import CourseAssignmentsContent from "@/components/courses/CourseAssignmentsContent";
import CourseQuizzesContent from "@/components/courses/CourseQuizzesContent";

const CourseOverview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    fetchCourseDetails,
    fetchChaptersForCourse,
    fetchLecturesByChapter,
    fetchLecturesForCourse,
    fetchLectureCount,
    currentCourseDetails,
  } = useCourse();

  const [loading, setLoading] = useState(true);
  const [chaptersWithLectures, setChaptersWithLectures] = useState([]);
  const [flatLectures, setFlatLectures] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "chapters";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openChapters, setOpenChapters] = useState({});
  const [lectureCount, setLectureCount] = useState(0);

  // Sidebar toggle state
  const [isCourseSidebarCollapsed, setIsCourseSidebarCollapsed] =
    useState(false);
  const toggleCourseSidebar = () =>
    setIsCourseSidebarCollapsed((prev) => !prev);

  // Attachments modal state
  const [attachmentsLecture, setAttachmentsLecture] = useState(null);
  const openAttachments = (lecture) => setAttachmentsLecture(lecture);
  const closeAttachments = () => setAttachmentsLecture(null);

  // --------------------------------------
  // Load course + content
  // --------------------------------------
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      setLoading(true);

      const course = await fetchCourseDetails(courseId);
      if (!course) {
        setLoading(false);
        return;
      }

      if (course.hasDirectLectures) {
        const lectures = await fetchLecturesForCourse(courseId);
        setFlatLectures(lectures || []);
      } else {
        const chapters = await fetchChaptersForCourse(courseId);
        const fullChapters = await Promise.all(
          (chapters || []).map(async (ch) => {
            const lectures = await fetchLecturesByChapter(ch._id);
            return { ...ch, lectures: lectures || [] };
          })
        );
        setChaptersWithLectures(fullChapters);
      }

      const count = await fetchLectureCount(course);
      setLectureCount(count);

      setLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    const t = searchParams.get("tab") || "chapters";
    setActiveTab(t);
  }, [searchParams]);

  // --------------------------------------
  // Derived helpers
  // --------------------------------------
  const isChapterBased = !currentCourseDetails?.hasDirectLectures;

  // Single flat list for Notes / Assignments / Quizzes tabs
  const allLectures = useMemo(() => {
    if (isChapterBased) {
      return chaptersWithLectures.flatMap((ch) => ch.lectures || []);
    }
    return flatLectures;
  }, [isChapterBased, chaptersWithLectures, flatLectures]);

  // --------------------------------------
  // Loading guard
  // --------------------------------------
  if (loading || !currentCourseDetails) {
    return (
      <div className="bg-[#101010] min-h-screen flex items-center justify-center text-white text-lg">
        Loading course overview...
      </div>
    );
  }

  // --------------------------------------
  // Render
  // --------------------------------------
  return (
    <div className="bg-[#101010] min-h-screen text-white flex">
      {/* Sidebar */}
      <CourseOverviewSidebar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setSearchParams((prev) => {
            const sp = new URLSearchParams(prev);
            sp.set("tab", t);
            return sp;
          });
        }}
        course={currentCourseDetails}
        chaptersWithLectures={chaptersWithLectures}
        directLectures={flatLectures}
        isCollapsed={isCourseSidebarCollapsed}
      />

      {/* Right Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCourseSidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        {/* Navbar + toggle */}
        <Navbar
          onCourseSidebarToggle={toggleCourseSidebar}
          isSidebarCollapsed={isCourseSidebarCollapsed}
        />

        {/* Main content */}
        <div className="p-6">
          {/* Overview */}
          {activeTab === "overview" && (
            <CourseDetailsContent
              lectureCount={lectureCount}
              openChapters={openChapters}
              setOpenChapters={setOpenChapters}
            />
          )}

          {/* Chapters / All Content */}
          {activeTab === "chapters" && (
            <CourseAllContents
              isChapterBased={isChapterBased}
              chaptersWithLectures={chaptersWithLectures}
              flatLectures={flatLectures}
              currentCourseDetails={currentCourseDetails}
              navigate={navigate}
              courseId={courseId}
              openAttachments={openAttachments}
            />
          )}

          {/* Notes */}
          {activeTab === "notes" && (
            <CourseNotesContent allLectures={allLectures} />
          )}

          {/* Assignments */}
          {activeTab === "assignments" && (
            <CourseAssignmentsContent allLectures={allLectures} />
          )}

          {/* Quizzes */}
          {activeTab === "quizzes" && (
            <CourseQuizzesContent allLectures={allLectures} />
          )}
        </div>
      </div>

      {/* Global Attachments Modal */}
      <LectureAttachmentsModal
        isOpen={!!attachmentsLecture}
        onClose={closeAttachments}
        lecture={attachmentsLecture}
      />
    </div>
  );
};

export default CourseOverview;
