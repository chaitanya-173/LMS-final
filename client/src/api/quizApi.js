// src/api/quizApi.js
import axios from "@/api/axiosInstance";

export async function fetchQuizStatus(lectureId) {
  try {
    const { data } = await axios.get(`/api/student/quiz/${lectureId}/status`);
    return data;
  } catch (err) {
    console.error("Failed to fetch quiz status:", err);
    return { attempted: false, error: true };
  }
}

export async function fetchQuizResult(lectureId) {
  try {
    const { data } = await axios.get(`api/student/quiz/${lectureId}/result`);
    console.log(lectureId);
    console.log(data);
    return data;
  } catch (err) {
    console.error("Failed to load quiz result:", err);
    return { error: true };
  }
}
