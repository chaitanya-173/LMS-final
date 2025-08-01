import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext"; // to get token/user

// Context Create
const InstructorContext = createContext();

export const InstructorProvider = ({ children }) => {
  const { token } = useAuth(); // assuming AuthContext provides token
  const [instructorLectures, setInstructorLectures] = useState([]); // All lectures of instructor
  const [loadingLectures, setLoadingLectures] = useState(false);

  /** ---------------------------
   * Fetch Instructor Lecture Library
   * --------------------------- */
  const fetchInstructorLectures = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingLectures(true);
      const res = await axios.get("/api/instructor/lectures/library", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      setInstructorLectures(res.data?.lectures || []);
    } catch (err) {
      console.error("fetchInstructorLectures error:", err);
      toast.error("Failed to load lectures.");
    } finally {
      setLoadingLectures(false);
    }
  }, [token]);

  /** ---------------------------
   * Add Lecture to Local State (optional helper)
   * --------------------------- */
  const addLectureToLibrary = (lecture) => {
    setInstructorLectures((prev) => [lecture, ...prev]);
  };

  /** ---------------------------
   * Remove Lecture from Local State
   * --------------------------- */
  const removeLectureFromLibrary = (lectureId) => {
    setInstructorLectures((prev) => prev.filter((l) => l._id !== lectureId));
  };

  // Auto-fetch lectures when component mounts
  useEffect(() => {
    fetchInstructorLectures();
  }, [fetchInstructorLectures]);

  return (
    <InstructorContext.Provider
      value={{
        instructorLectures,
        loadingLectures,
        fetchInstructorLectures,
        addLectureToLibrary,
        removeLectureFromLibrary,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
};

// Custom Hook
export const useInstructor = () => useContext(InstructorContext);
