import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCourse } from "@/context/CourseContext";
import axios from "@/api/axiosInstance";
import toast from "react-hot-toast";
import { fetchQuizStatus } from "@/api/quizApi"; // using your helper

/* -----------------------------------------------------------
 * Color tokens
 * --------------------------------------------------------- */
const CLR_CURRENT = "bg-blue-500 text-white";
const CLR_ANSWERED = "bg-green-500 text-white";
const CLR_MARKED = "bg-orange-500 text-white"; // marked only
const CLR_ANS_MARK = "bg-purple-500 text-white"; // answered + marked
const CLR_EMPTY = "bg-transparent text-gray-300 border border-gray-500";

/* -----------------------------------------------------------
 * QuizAttemptPage
 * Route: /quiz/:lectureId
 * location.state?.questions optional; else load from context lecture.quiz
 * --------------------------------------------------------- */
const QuizAttemptPage = () => {
  const { lectureId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchLectureById } = useCourse() ?? {};

  /* ------------ ACCESS CONTROL (Route Guard) ------------ */
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchQuizStatus(lectureId);
        if (!alive) return;
        if (res?.attempted) {
          // Already attempted -> redirect to result page
          navigate(`/quiz/${lectureId}/result`, { replace: true });
        } else {
          setAllowed(true);
        }
      } catch (err) {
        console.error("Quiz status check failed:", err);
        toast.error("Unable to verify quiz status. Allowing access.");
        if (alive) setAllowed(true);
      } finally {
        if (alive) setCheckingStatus(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lectureId, navigate]);

  /* ------------ Load quiz questions (fast-path from state) ------------ */
  const stateQs = location.state?.questions;
  const stateLimit = location.state?.timeLimit; // seconds

  const [questions, setQuestions] = useState(stateQs || []);
  const [timeLimit, setTimeLimit] = useState(
    typeof stateLimit === "number" ? stateLimit : null
  );

  // Agar stateQs aaye hain to loading=false (fast path). Otherwise fetch karega.
  const [loading, setLoading] = useState(!stateQs);
  const [error, setError] = useState(null);

  // Submit in-flight flag
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (stateQs) return; // already have passed-in questions (and maybe timeLimit)
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const lec = await fetchLectureById?.(lectureId);
        if (!lec) throw new Error("Lecture not found.");

        // ----- Detect new vs old quiz format -----
        let qs = [];
        let lim = null;

        if (lec.quiz) {
          if (Array.isArray(lec.quiz)) {
            // legacy array
            qs = lec.quiz;
          } else if (typeof lec.quiz === "object") {
            // new shape
            qs = Array.isArray(lec.quiz.questions) ? lec.quiz.questions : [];
            if (
              typeof lec.quiz.timeLimit === "number" &&
              !Number.isNaN(lec.quiz.timeLimit)
            ) {
              lim = lec.quiz.timeLimit;
            }
          }
        }

        if (!ignore) {
          setQuestions(qs);
          setTimeLimit(lim);
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load quiz.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [lectureId, stateQs, fetchLectureById]);

  /* ------------ Fallback if no quiz ------------ */
  const allQuestions = useMemo(() => {
    if (questions?.length) return questions;
    // dummy 50 Qs (kept as in your original comments but using 10 to reduce noise? -> keeping original 50 comment but return 50)
    return Array.from({ length: 50 }).map((_, i) => ({
      question: `Dummy Question ${i + 1}: What does option A mean?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
    }));
  }, [questions]);

  const total = allQuestions.length;

  /* ------------ Attempt state ------------ */
  // [{ answerIdx: number|null, marked: bool }, ...]
  const [attempts, setAttempts] = useState(() =>
    allQuestions.map(() => ({ answerIdx: null, marked: false }))
  );

  // reset attempts if question data changes length
  useEffect(() => {
    setAttempts(allQuestions.map(() => ({ answerIdx: null, marked: false })));
  }, [allQuestions.length]);

  const [currentIdx, setCurrentIdx] = useState(0);

  /* ------------ Timer ------------ */
  // priority: timeLimit from backend/state; else dummy 1hr
  const initialSeconds = useMemo(() => {
    if (typeof timeLimit === "number" && timeLimit > 0) return timeLimit;
    return 60 * 60; // fallback 1 hr
  }, [timeLimit]);

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  // reset timer if timeLimit changes (e.g., after fetch)
  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  // countdown effect — one interval total
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []); // run once

  // Auto-submit jab timer zero
  useEffect(() => {
    if (secondsLeft === 0 && !submitting) {
      submitQuiz(); // will respect submitting flag
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const timeLabel = formatTime(secondsLeft);

  /* ------------ Answered count for progress ------------ */
  // Count answered OR answered+marked (purple). Marked-only (orange) not counted.
  const answeredCount = attempts.reduce((acc, a) => {
    if (a?.answerIdx !== null && a?.answerIdx !== undefined) acc += 1;
    return acc;
  }, 0);

  /* ------------ Color logic for sidebar cell ------------ */
  const getCellClass = useCallback(
    (i) => {
      const attempt = attempts[i];
      const isCurrent = i === currentIdx;

      if (isCurrent) return CLR_CURRENT;
      if (!attempt) return CLR_EMPTY;

      const hasAnswer =
        attempt.answerIdx !== null && attempt.answerIdx !== undefined;
      if (hasAnswer && attempt.marked) return CLR_ANS_MARK;
      if (hasAnswer) return CLR_ANSWERED;
      if (attempt.marked) return CLR_MARKED;
      return CLR_EMPTY;
    },
    [attempts, currentIdx]
  );

  /* ------------ Select / toggle answer ------------ */
  const chooseAnswer = (optIdx) => {
    setAttempts((prev) => {
      const copy = [...prev];
      const curr = {
        ...(copy[currentIdx] || { answerIdx: null, marked: false }),
      };

      // Toggle off if selecting same option
      if (curr.answerIdx === optIdx) {
        curr.answerIdx = null;
      } else {
        curr.answerIdx = optIdx;
      }

      copy[currentIdx] = curr;
      return copy;
    });
  };

  /* ------------ Clear current answer ------------ */
  const clearAnswer = () => {
    setAttempts((prev) => {
      const copy = [...prev];
      const curr = {
        ...(copy[currentIdx] || { answerIdx: null, marked: false }),
      };
      curr.answerIdx = null;
      copy[currentIdx] = curr;
      return copy;
    });
  };

  /* ------------ Toggle mark for review ------------ */
  const toggleMark = () => {
    setAttempts((prev) => {
      const copy = [...prev];
      const curr = {
        ...(copy[currentIdx] || { answerIdx: null, marked: false }),
      };
      curr.marked = !curr.marked;
      copy[currentIdx] = curr;
      return copy;
    });
  };

  /* ------------ Navigation handlers ------------ */
  const goBack = () => navigate(-1);

  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= total) return;
    setCurrentIdx(idx);
  };

  const skip = () => {
    if (currentIdx < total - 1) setCurrentIdx((i) => i + 1);
  };

  const next = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      // last -> submit
      submitQuiz();
    }
  };

  const prev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  /* ------------ Submit Quiz ------------ */
  const submitQuiz = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Turn attempts → API format
      const payloadAnswers = allQuestions.map((q, i) => ({
        question: q.question,
        selectedAnswer:
          attempts[i]?.answerIdx !== null &&
          attempts[i]?.answerIdx !== undefined
            ? q.options[attempts[i].answerIdx]
            : "",
      }));

      // seconds used = initial - remaining (clamp >= 0)
      const timeTaken = Math.max(0, (initialSeconds ?? 0) - secondsLeft);

      const payload = {
        answers: payloadAnswers,
        timeTaken,
      };

      const { data } = await axios.post(
        `/api/student/quiz/${lectureId}`,
        payload
      );

      toast?.success?.("Quiz submitted!");
      console.log("Quiz submission success:", data);

      // Redirect to result page with result data
      navigate(`/quiz/${lectureId}/result`, { state: { quizResult: data } });
    } catch (err) {
      console.error("Quiz submission error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit quiz.";
      toast?.error?.(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    allQuestions,
    attempts,
    initialSeconds,
    secondsLeft,
    lectureId,
    navigate,
  ]);

  /* ------------ Current Q ------------ */
  const q = allQuestions[currentIdx];
  const currAttempt = attempts[currentIdx] || {
    answerIdx: null,
    marked: false,
  };

  /* ------------ Render ------------ */
  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen flex flex-col">
      <Navbar />

      {/* Guard states */}
      {checkingStatus ? (
        <div className="flex-1 flex items-center justify-center">
          Checking quiz status...
        </div>
      ) : !allowed ? (
        <div className="flex-1 flex items-center justify-center text-red-400">
          Not allowed to access this quiz.
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-[340px] lg:w-[380px] flex-shrink-0 border-r border-[#2a2a2a] bg-[#181818] flex flex-col">
            {/* --- TOP (Sticky) --- */}
            <div className="px-4 pt-4 pb-3 border-b border-[#2a2a2a]">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md px-2 py-1"
              >
                <ArrowLeft size={18} />
                <span className="text-sm">Back</span>
              </button>
              <h2 className="text-xl font-semibold mt-2">QUIZ</h2>
            </div>

            {/* --- Progress Bar --- */}
            <div className="px-4 pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-300">
                  Questions
                </span>
                <span className="text-xs text-gray-400">
                  {String(answeredCount).padStart(2, "0")}/{total}
                </span>
              </div>

              <div className="relative h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-green-500 transition-all"
                  style={{
                    width: `${total ? (answeredCount / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* --- SCROLLABLE QUESTION GRID --- */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <QuestionGrid
                total={total}
                currentIdx={currentIdx}
                attempts={attempts}
                goToQuestion={goToQuestion}
                getCellClass={getCellClass}
              />
            </div>

            {/* --- BOTTOM LEGEND (Sticky) --- */}
            <div className="px-4 py-4 border-t border-[#2a2a2a] space-y-2 text-xs">
              <LegendRow colorClass="bg-green-500" label="Answered" />
              <LegendRow
                colorClass="bg-blue-500"
                label="Currently Attempting"
              />
              <LegendRow colorClass="bg-orange-500" label="Marked for Review" />
              <LegendRow
                colorClass="bg-purple-500"
                label="Answered & Marked"
              />
              <LegendRow
                colorClass="border border-gray-500"
                label="Not Attempted"
              />
            </div>
          </aside>

          {/* Main question panel */}
          <main className="flex-1 flex flex-col">
            {/* Question header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#181818]">
              <div className="text-sm text-gray-400">
                Question{" "}
                <span className="text-white font-medium">{currentIdx + 1}</span>
                /{total}
              </div>
              <div className="inline-flex items-center gap-1 text-sm text-gray-300">
                <Clock size={16} />
                {timeLabel}
              </div>
            </div>

            {/* Question body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loading ? (
                <div className="text-gray-400 text-sm">Loading quiz…</div>
              ) : error ? (
                <div className="text-red-400 text-sm">{error}</div>
              ) : (
                <QuestionBlock
                  question={q}
                  currentAnswerIdx={currAttempt.answerIdx}
                  onChoose={chooseAnswer}
                  onClear={clearAnswer}
                />
              )}
            </div>

            {/* Bottom controls */}
            <div className="px-6 py-4 border-t border-[#2a2a2a] bg-[#181818] flex items-center justify-between gap-3">
              {/* Left controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <ButtonGhost
                  iconLeft={<ChevronLeft size={18} />}
                  disabled={currentIdx === 0}
                  onClick={prev}
                >
                  Prev
                </ButtonGhost>

                <ButtonGhost onClick={skip}>Skip</ButtonGhost>

                <ButtonGhost
                  iconLeft={<Flag size={16} />}
                  pressed={currAttempt.marked}
                  onClick={toggleMark}
                >
                  {currAttempt.marked ? "Unmark" : "Mark for Review"}
                </ButtonGhost>

                <ButtonGhost
                  iconLeft={<XCircle size={16} />}
                  onClick={clearAnswer}
                  disabled={currAttempt.answerIdx === null}
                >
                  Clear
                </ButtonGhost>

                <ButtonGhost
                  onClick={next}
                  iconRight={<ChevronRight size={18} />}
                >
                  {currentIdx === total - 1 ? "Finish" : "Next"}
                </ButtonGhost>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <ButtonPrimary onClick={submitQuiz} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </ButtonPrimary>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptPage;

/* =========================================================
 * Question Grid (8 columns)
 * ======================================================= */
const QuestionGrid = ({
  total,
  currentIdx,
  attempts,
  goToQuestion,
  getCellClass,
}) => {
  return (
    <div className="grid grid-cols-8 gap-x-1 gap-y-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => goToQuestion(i)}
          className={`w-8 h-8 rounded-md text-[11px] font-medium flex items-center justify-center transition ${getCellClass(
            i
          )}`}
          title={`Go to question ${i + 1}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

/* =========================================================
 * Legend Row
 * ======================================================= */
const LegendRow = ({ colorClass, label }) => (
  <div className="flex items-center gap-2">
    <span className={`inline-block w-4 h-4 rounded-sm ${colorClass}`} />
    <span className="text-gray-300">{label}</span>
  </div>
);

/* =========================================================
 * QuestionBlock
 * ======================================================= */
const QuestionBlock = ({ question, currentAnswerIdx, onChoose, onClear }) => {
  if (!question) return null;

  const { question: text, options = [] } = question;

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">{text}</h3>
      <ul className="space-y-3">
        {options.map((opt, idx) => {
          const selected = currentAnswerIdx === idx;
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => onChoose(idx)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  selected
                    ? "bg-blue-600 border-blue-500"
                    : "bg-[#1f1f1f] border-[#2a2a2a] hover:bg-[#2a2a2a]"
                }`}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Clear Response */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onClear}
          disabled={currentAnswerIdx === null}
          className="text-xs text-gray-400 hover:text-orange-400 disabled:opacity-40 underline"
        >
          Clear Response
        </button>
      </div>
    </div>
  );
};

/* =========================================================
 * Buttons
 * ======================================================= */
const ButtonGhost = ({
  children,
  iconLeft,
  iconRight,
  onClick,
  disabled,
  pressed,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm transition
      ${
        pressed
          ? "border-purple-500 text-purple-400 bg-purple-500/10"
          : "border-[#2a2a2a] text-gray-300 hover:bg-white/10 disabled:opacity-40"
      }`}
  >
    {iconLeft}
    {children}
    {iconRight}
  </button>
);

const ButtonPrimary = ({
  children,
  iconLeft,
  iconRight,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-semibold transition
      ${
        disabled
          ? "bg-orange-500/50 cursor-not-allowed text-black/60"
          : "bg-orange-500 hover:bg-orange-400 text-black"
      }`}
  >
    {iconLeft}
    {children}
    {iconRight}
  </button>
);

/* =========================================================
 * Utils
 * ======================================================= */
function formatTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
