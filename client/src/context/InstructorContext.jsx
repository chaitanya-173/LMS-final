import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const InstructorContext = createContext();

export const InstructorProvider = ({ children }) => {
  const { token } = useAuth();
  const [instructorLectures, setInstructorLectures] = useState([]);
  const [loadingLectures, setLoadingLectures] = useState(false);

  /** ---------------------------
   * Fetch Instructor Lecture Library with complete data
   * --------------------------- */
  const fetchInstructorLectures = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingLectures(true);
      const res = await axios.get("/api/instructor/lectures/library", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('🔍 Raw instructor lectures API response:', res.data); // Debug log
      
      const rawLectures = res.data?.lectures || [];
      
      // ✅ CRITICAL: Map lectures with complete data structure
      const mappedLectures = rawLectures.map((lec) => {
        console.log('📝 Processing instructor library lecture:', lec); // Debug individual lecture
        
        return {
          _id: lec._id,
          title: lec.title || "",
          thumbnail: lec.thumbnail || null,        // ✅ Object {url, publicId}
          video: lec.video || null,                // ✅ Object {url, publicId}
          notes: lec.notes || null,                // ✅ Object with fileUrl, fileName
          assignment: lec.assignment || null,      // ✅ Object with fileUrl, fileName, title
          quiz: lec.quiz || null,                  // ✅ Object with questions array
          codeLink: lec.codeLink || "",            // ✅ String URL
          codeUrl: lec.codeUrl || "",              // ✅ Backward compatibility
          createdAt: lec.createdAt,
          updatedAt: lec.updatedAt,
        };
      });
      
      console.log('📚 Mapped instructor lectures:', mappedLectures); // Debug mapped data
      
      setInstructorLectures(mappedLectures);
    } catch (err) {
      console.error("fetchInstructorLectures error:", err);
      toast.error("Failed to load lectures.");
    } finally {
      setLoadingLectures(false);
    }
  }, [token]);

  /** ---------------------------
   * Add Lecture to Local State
   * --------------------------- */
  const addLectureToLibrary = (lecture) => {
    console.log('➕ Adding lecture to library:', lecture);
    
    // Ensure proper structure
    const normalizedLecture = {
      _id: lecture._id,
      title: lecture.title || "",
      thumbnail: lecture.thumbnail || null,
      video: lecture.video || null,
      notes: lecture.notes || null,
      assignment: lecture.assignment || null,
      quiz: lecture.quiz || null,
      codeLink: lecture.codeLink || "",
      codeUrl: lecture.codeUrl || "",
      createdAt: lecture.createdAt || new Date().toISOString(),
      updatedAt: lecture.updatedAt || new Date().toISOString(),
    };
    
    setInstructorLectures((prev) => [normalizedLecture, ...prev]);
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
