import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { fetchQuizResult } from "@/api/quizApi"; // <- uses your axios instance

const QuizResult = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  /* Fetch real quiz result */
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await fetchQuizResult(lectureId);
      if (!alive) return;

      if (res?.error) {
        setErrorMsg("Failed to load quiz result.");
        setResult(null);
      } else {
        setResult(res);
        setErrorMsg(null);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [lectureId]);

  /* Derived safe values */
  const submittedLabel = useMemo(() => {
    if (!result?.submittedAt) return "";
    return new Date(result.submittedAt).toLocaleString();
  }, [result?.submittedAt]);

  const score = result?.score ?? 0;
  const totalQuestions =
    result?.totalQuestions ??
    result?.total ?? // fallback if backend used "total"
    (result?.answers ? result.answers.length : 0);
  const timeTaken = result?.timeTaken ?? 0;

  /* Render states */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Loading quiz result...
        </div>
      </div>
    );
  }

  if (errorMsg || !result) {
    return (
      <div className="min-h-screen bg-[#111] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400">{errorMsg || "Result not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] px-4 py-2 rounded-md text-sm font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const answers = Array.isArray(result.answers) ? result.answers : [];

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Navbar */}
      <Navbar />

      {/* Back + Title */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold">Quiz Result</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Performance Summary */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-wrap justify-between gap-4 mb-6 border border-gray-800">
          <div>
            <h2 className="text-gray-400 text-sm">Your Performance</h2>
            <p className="text-3xl font-bold text-green-400">
              {score}/{totalQuestions}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Time Taken</p>
            <p className="text-lg">{formatTime(timeTaken)}</p>
            <p className="text-xs text-gray-500">{submittedLabel}</p>
          </div>
        </div>

        {/* Question Breakdown */}
        <h2 className="text-xl font-semibold mb-4">Question Breakdown</h2>
        <div className="space-y-4">
          {answers.map((ans, index) => {
            const questionText = ans.question || `Question ${index + 1}`;
            const selected = norm(ans.selectedAnswer);
            const correct = norm(ans.correctAnswer);
            const isUnanswered = selected === "" || selected == null;
            const isCorrect =
              !isUnanswered &&
              (ans.isCorrect === true ||
                (selected && correct && selected === correct));

            /**
             * Options?
             * Backend result doesn't include full options list.
             * So for now we show only Selected + Correct rows.
             * If you want full options, fetch lecture quiz too.
             */
            const showOptions = Array.isArray(ans.options) && ans.options.length;

            return (
              <div
                key={index}
                className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
              >
                {/* Question Header */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium">
                    Q{index + 1}: {questionText}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isUnanswered ? (
                      <>
                        <span className="text-gray-400 text-sm">
                          Not Answered
                        </span>
                        <MinusCircle className="text-gray-500" size={18} />
                      </>
                    ) : isCorrect ? (
                      <CheckCircle className="text-green-400" size={20} />
                    ) : (
                      <XCircle className="text-red-400" size={20} />
                    )}
                  </div>
                </div>

                {/* Option List: use full options if provided; else fallback rows */}
                {showOptions ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {ans.options.map((opt, i) => {
                      const optNorm = norm(opt);
                      let row =
                        "bg-[#2a2a2a] text-gray-300 border border-transparent";

                      if (optNorm === correct) {
                        row =
                          "bg-[#19361e] text-green-400 border border-green-500/40";
                      }
                      if (
                        optNorm === selected &&
                        !isCorrect &&
                        !isUnanswered
                      ) {
                        row =
                          "bg-[#3a1f1f] text-red-400 border border-red-500/40";
                      }
                      // if correct & selected same, green row wins (order matters above)

                      return (
                        <div
                          key={i}
                          className={`rounded-md px-3 py-2 text-sm ${row}`}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 space-y-1 text-sm">
                    {isUnanswered ? (
                      <p className="text-gray-400 italic">
                        You did not answer this question.
                      </p>
                    ) : isCorrect ? (
                      <p className="text-green-400">
                        Your Answer: {selected}
                      </p>
                    ) : (
                      <>
                        <p className="text-red-400">
                          Your Answer: {selected || "—"}
                        </p>
                        <p className="text-green-400">
                          Correct Answer: {correct || "—"}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Back to Courses */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;

/* ----------------- Helpers ----------------- */
function formatTime(seconds) {
  if (!seconds || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function norm(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}
