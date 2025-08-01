import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [currentCourseDetails, setCurrentCourseDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCourseChapters, setCurrentCourseChapters] = useState([]);
  const [currentCourseLectures, setCurrentCourseLectures] = useState([]);

  useEffect(() => {
    console.log("CourseContext - user:", user);
    console.log("CourseContext - token:", token);

    fetchAllCourses();
    if (user && token) {
      console.log("Fetching my courses...");
      fetchMyCourses();
    }
  }, [user, token]);

  // 🔹 Initial load
  useEffect(() => {
    fetchAllCourses();
    if (user && token) fetchMyCourses();
  }, [user]);

  // 🔹 Clear course detail when unmounting
  useEffect(() => {
    return () => setCurrentCourseDetails(null);
  }, []);

  // 🔹 Fetch all available courses
  const fetchAllCourses = async () => {
    try {
      const res = await axios.get("/api/student/courses");
      setAllCourses(res.data?.courses || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load all courses");
    }
  };

  // 🔹 Fetch courses the user is enrolled in
  const fetchMyCourses = async () => {
    if (!token) return;

    try {
      const res = await axios.get("/api/student/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolledCourses(res.data?.courses || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your enrolled courses");
    }
  };

  // 🔹 Get details of a specific course
  const fetchCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      setCurrentCourseDetails(null); // clear old before fetch
  
      const res = await axios.get(`/api/student/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const course = res.data?.course || null;
      setCurrentCourseDetails(course);
      return course; // ✅ important
  
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch course details");
      return null; // ✅ fail-safe
    } finally {
      setLoading(false);
    }
  };
  
  // 🔹 Enroll in a course
  const enrollInCourse = async (courseId) => {
    try {
      await axios.post(
        `/api/student/enroll/${courseId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Enrolled successfully");
      fetchMyCourses(); // refresh enrolled list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Enrollment failed");
    }
  };

  // 🔹 Fetch a chapter
  const fetchChaptersForCourse = async (courseId) => {
    try {
      const res = await axios.get(
        `/api/instructor/chapters/course/${courseId}`
      );
      const chapters = res.data?.chapters || [];
      setCurrentCourseChapters(chapters);
      return chapters; // <-- This line is important
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast.error("Failed to load chapters");
      return []; // fallback
    }
  };

  // 🔹 Fetch a lecture by courseId
  const fetchLecturesForCourse = async (courseId) => {
    try {
      const res = await axios.get(
        `/api/instructor/lectures/by-course/${courseId}`
      );
      const lectures = res.data?.lectures || [];
      setCurrentCourseLectures(lectures);
      return lectures; // 🔥 ADD THIS LINE
    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast.error("Failed to load lectures");
      return [];
    }
  };

  // 🔹 Fetch a lecture by chapterId
  const fetchLecturesByChapter = async (chapterId) => {
    try {
      const res = await axios.get(
        `/api/instructor/lectures/by-chapter/${chapterId}`
      );
      return res.data.lectures || []; // safest
    } catch (err) {
      console.error("Failed to fetch lectures by chapter:", err);
      return [];
    }
  };

  // 🔹 Fetch a lecture by lectureId
  const fetchLectureById = async (lectureId) => {
    try {
      const res = await axios.get(`/api/instructor/lectures/${lectureId}`);
      return res.data || null;
    } catch (err) {
      console.error("Failed to fetch lecture by ID:", err);
      toast.error("Lecture load failed");
      return null;
    }
  };

  // 🔹 Fetch lecture count
  const fetchLectureCount = async (course) => {
    try {
      if (course.hasDirectLectures) {
        // 🔹 Get lectures directly from course
        const res = await axios.get(
          `/api/instructor/lectures/by-course/${course._id}`
        );
        return res.data?.lectures?.length || 0;
      } else {
        // Chapter-based structure
        const chapterIds = course.curriculum || [];
        let total = 0;

        for (const chapterId of chapterIds) {
          const res = await axios.get(
            `/api/instructor/lectures/by-chapter/${chapterId}`
          );
          const lectures = res.data?.lectures || [];
          total += lectures.length;
        }

        return total;
      }
    } catch (error) {
      console.error("Failed to count lectures:", error);
      return 0;
    }
  };

  // 🔹 Submit assignment
  const submitAssignment = async (lectureId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`/api/student/assignment/${lectureId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Assignment submitted");
    } catch (err) {
      console.error(err);
      toast.error("Assignment submission failed");
    }
  };

  // 🔹 Submit quiz
  const submitQuiz = async (lectureId, answers) => {
    try {
      await axios.post(`/api/student/quiz/${lectureId}`, answers, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Quiz submitted");
    } catch (err) {
      console.error(err);
      toast.error("Quiz submission failed");
    }
  };

  const isUserEnrolledInCourse = (courseId) => {
    return enrolledCourses.some((c) => c._id === courseId);
  };

  return (
    <CourseContext.Provider
      value={{
        allCourses,
        enrolledCourses,
        currentCourseDetails,
        loading,
        fetchAllCourses,
        fetchMyCourses,
        fetchCourseDetails,
        enrollInCourse,
        currentCourseChapters,
        fetchChaptersForCourse,
        fetchLecturesByChapter,
        fetchLectureById,
        currentCourseLectures,
        fetchLecturesForCourse,
        fetchLectureCount,
        submitAssignment,
        submitQuiz,
        isUserEnrolledInCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => useContext(CourseContext);
