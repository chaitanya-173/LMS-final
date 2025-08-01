// src/api/assignmentApi.js
import axios from "@/api/axiosInstance";

export async function fetchAssignmentStatus(lectureId) {
  try {
    const { data } = await axios.get(`/api/student/assignments/${lectureId}/status`);
    return data;
  } catch (err) {
    console.error("Failed to load assignment status:", err);
    return { error: true };
  }
}
