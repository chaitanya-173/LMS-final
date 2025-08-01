import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HelpCircle, Search, ListChecks, ExternalLink } from "lucide-react";
import { useCourse } from "@/context/CourseContext";
import { fetchQuizStatus } from "@/api/quizApi";
import toast from "react-hot-toast";

const CourseQuizzesContent = ({ allLectures }) => {
  const navigate = useNavigate();
  const { currentCourseDetails } = useCourse() ?? {};

  const [search, setSearch] = useState("");
  const [statusByQuiz, setStatusByQuiz] = useState({}); // { lectureId: { loading, attempted, error } }

  /** Build quiz list */
  const quizzes = useMemo(() => {
    return (allLectures || [])
      .filter((lec) => lec.quiz && lec.quiz.questions?.length > 0)
      .map((lec) => ({
        lectureId: lec._id,
        lectureTitle: lec.title,
        questionCount: lec.quiz.questions.length,
      }));
  }, [allLectures]);

  /** Fetch quiz attempt status */
  useEffect(() => {
    let cancelled = false;

    async function loadStatuses() {
      const updated = {};
      for (const quiz of quizzes) {
        updated[quiz.lectureId] = { loading: true, attempted: false, error: null };
      }
      setStatusByQuiz(updated);

      await Promise.all(
        quizzes.map(async (quiz) => {
          try {
            const res = await fetchQuizStatus(quiz.lectureId);
            if (!cancelled) {
              setStatusByQuiz((prev) => ({
                ...prev,
                [quiz.lectureId]: {
                  loading: false,
                  attempted: Boolean(res?.attempted),
                  error: null,
                },
              }));
            }
          } catch (err) {
            console.error("Quiz status fetch failed:", err);
            if (!cancelled) {
              setStatusByQuiz((prev) => ({
                ...prev,
                [quiz.lectureId]: { loading: false, attempted: false, error: true },
              }));
            }
          }
        })
      );
    }
    if (quizzes.length > 0) loadStatuses();
    return () => (cancelled = true);
  }, [quizzes]);

  /** Filter quizzes */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quizzes;
    return quizzes.filter((quiz) => quiz.lectureTitle.toLowerCase().includes(q));
  }, [search, quizzes]);

  /** Handle quiz click */
  const handleQuizAction = async (quiz) => {
    try {
      const status = await fetchQuizStatus(quiz.lectureId);
      if (status?.attempted) {
        navigate(`/quiz/${quiz.lectureId}/result`);
      } else {
        // lecture object se actual quiz data nikalna
        const lecture = allLectures.find((lec) => lec._id === quiz.lectureId);
        let quizQuestions = [];
        let quizTimeLimit = null;
  
        if (lecture?.quiz) {
          if (Array.isArray(lecture.quiz)) {
            quizQuestions = lecture.quiz;
          } else if (typeof lecture.quiz === "object") {
            quizQuestions = Array.isArray(lecture.quiz.questions)
              ? lecture.quiz.questions
              : [];
            if (
              typeof lecture.quiz.timeLimit === "number" &&
              !Number.isNaN(lecture.quiz.timeLimit)
            ) {
              quizTimeLimit = lecture.quiz.timeLimit;
            }
          }
        }
  
        navigate(`/quiz/${quiz.lectureId}`, {
          state: {
            questions: quizQuestions,
            timeLimit: quizTimeLimit,
          },
        });
      }
    } catch (err) {
      console.error("Failed to verify quiz status:", err);
      toast.error("Unable to start quiz. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle size={20} className="text-[#3a9aed]" />
          <h1 className="text-2xl font-semibold">
            {currentCourseDetails?.title
              ? `${currentCourseDetails.title} • Quizzes`
              : "Course Quizzes"}
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3a9aed]"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-16 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-gray-500 text-sm">
            No quizzes found.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((quiz) => {
              const status = statusByQuiz[quiz.lectureId] || {};
              const loading = status.loading;
              const attempted = status.attempted;
              const error = status.error;

              return (
                <li
                  key={quiz.lectureId}
                  className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a9aed] hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <ListChecks
                      size={20}
                      className="text-[#3a9aed] mt-[2px] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {quiz.lectureTitle}
                      </p>
                      <p className="text-xs text-gray-400">
                        {quiz.questionCount} Questions
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    disabled={loading || error}
                    onClick={() => handleQuizAction(quiz)}
                    className={`mt-auto inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition ${
                      loading
                        ? "bg-[#2a2a2a] text-gray-400 cursor-not-allowed"
                        : attempted
                        ? "bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white"
                        : "bg-[#2a2a2a] hover:bg-[#3a9aed] hover:text-black"
                    }`}
                  >
                    {loading
                      ? "Loading..."
                      : attempted
                      ? "View Result"
                      : "Attempt Quiz"}
                    <ExternalLink size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseQuizzesContent;
