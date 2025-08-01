import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FileText,
  ClipboardList,
  BookOpen,
  Code,
  ExternalLink,
  Eye,
  FileCheck,
  Upload,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchQuizStatus } from "@/api/quizApi";
import { fetchAssignmentStatus } from "@/api/assignmentApi";

const tabs = [
  { id: "notes", label: "Notes", icon: <FileText size={16} /> },
  { id: "assignment", label: "Assignment", icon: <BookOpen size={16} /> },
  { id: "quiz", label: "Quiz", icon: <ClipboardList size={16} /> },
  { id: "code", label: "Code Repo", icon: <Code size={16} /> },
];

const LectureResourceTabs = ({ lecture }) => {
  const [activeTab, setActiveTab] = useState("notes");
  const [quizStatus, setQuizStatus] = useState({ loading: true, attempted: false });
  const navigate = useNavigate();
  const hasCode = !!lecture?.codeLink;

  if (!lecture) return null;

  useEffect(() => {
    if (!lecture?._id || !lecture.quiz) return;
    const loadQuizStatus = async () => {
      try {
        setQuizStatus((prev) => ({ ...prev, loading: true }));
        const res = await fetchQuizStatus(lecture._id);
        setQuizStatus({ loading: false, attempted: Boolean(res?.attempted) });
      } catch (err) {
        console.error("Quiz status fetch failed:", err);
        setQuizStatus({ loading: false, attempted: false });
      }
    };
    loadQuizStatus();
  }, [lecture?._id, lecture?.quiz]);

  if (!lecture) return null;

  return (
    <div className="mt-6 bg-[#1a1a1a] rounded-lg shadow-md p-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700 pb-2 relative">
        {tabs.map((tab) => {
          // hide code tab if no codeLink
          if (tab.id === "code" && !hasCode) return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-2 px-2 transition-colors ${
                activeTab === tab.id
                  ? "text-orange-400 border-b-2 border-orange-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "notes" && <SingleLectureNotes lecture={lecture} />}
        {activeTab === "assignment" && (
          <AssignmentBlock lecture={lecture} />
        )}
        {activeTab === "quiz" && (
          <SingleLectureQuiz
            lecture={lecture}
            quizStatus={quizStatus}
            navigate={navigate}
          />
        )}
        {activeTab === "code" && <CodeRepoBlock repoLink={lecture.codeLink} />}
      </div>
    </div>
  );
};

export default LectureResourceTabs;

/* --------- SINGLE LECTURE NOTES --------- */
const SingleLectureNotes = ({ lecture }) => {
  const navigate = useNavigate();

  if (!lecture?.notes?.fileUrl)
    return <p className="text-gray-400">No notes available.</p>;

  const openNote = () => {
    navigate(`/pdf-viewer/${lecture._id}/notes`, {
      state: {
        fileUrl: lecture.notes.fileUrl,
        fileName: lecture.notes.fileName || "Notes.pdf",
        lectureTitle: lecture.title,
      },
    });
  };

  return (
    <div className="bg-[#111] p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <FileText size={18} /> Lecture Notes
      </h3>
      <button
        onClick={openNote}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
      >
        Open Notes <ExternalLink size={14} />
      </button>
    </div>
  );
};

/* --------- SINGLE LECTURE ASSIGNMENT --------- */
const AssignmentBlock = ({ lecture }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [status, setStatus] = useState({
    loading: true,
    error: false,
    submitted: false,
    submissionId: null,
    submissionFiles: [],
    isLate: false,
    status: "loading",
    grade: null,
    score: null,
    remarks: null,
    assignment: lecture.assignment || {},
  });

  // Fetch assignment status
  useEffect(() => {
    let cancelled = false;
    const loadStatus = async () => {
      try {
        const res = await fetchAssignmentStatus(lecture._id);
        if (!res || res.error) {
          if (!cancelled) setStatus((prev) => ({ ...prev, loading: false, error: true }));
          return;
        }

        const submission = res.submission || null;
        const meta = res.assignment || {};

        if (!cancelled) {
          setStatus({
            loading: false,
            error: false,
            submitted: Boolean(res.submitted),
            submissionId: submission?._id || null,
            submissionFiles: submission?.files || [],
            isLate: submission?.isLate || false,
            status: submission?.status || (res.submitted ? "submitted" : "not_submitted"),
            grade: submission?.grade ?? null,
            score: submission?.score ?? null,
            remarks: submission?.remarks ?? null,
            assignment: {
              title: meta.title || lecture.assignment?.title || "Assignment",
              fileUrl: meta.fileUrl || lecture.assignment?.fileUrl || null,
              dueDate: meta.dueDate || lecture.assignment?.dueDate || null,
              allowResubmission: meta.allowResubmission ?? true,
            },
          });
        }
      } catch (err) {
        console.error("Assignment status fetch error:", err);
        if (!cancelled) setStatus((prev) => ({ ...prev, loading: false, error: true }));
      }
    };

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [lecture]);

  const viewAssignment = useCallback(() => {
    if (!status.assignment.fileUrl) return;
    navigate(`/pdf-viewer/${lecture._id}/assignment`, {
      state: {
        fileUrl: status.assignment.fileUrl,
        fileName: status.assignment.title,
        lectureTitle: lecture.title,
        courseId,
      },
    });
  }, [navigate, courseId, lecture, status]);

  const viewSubmittedFile = useCallback(
    (file) => {
      navigate(`/pdf-viewer/${lecture._id}/assignment`, {
        state: {
          fileUrl: file.fileUrl,
          fileName: file.fileName || status.assignment.title,
          lectureTitle: lecture.title,
          courseId,
          fromSubmission: true,
          submissionId: status.submissionId,
        },
      });
    },
    [navigate, courseId, lecture, status]
  );

  const submitAssignment = useCallback(() => {
    const now = Date.now();
    const dueMs = status.assignment.dueDate ? new Date(status.assignment.dueDate).getTime() : null;
    const pastDue = dueMs ? now > dueMs : false;

    if (status.grade) {
      toast.error("This assignment has been graded; you cannot resubmit.");
      return;
    }
    if (status.submitted && !status.assignment.allowResubmission) {
      toast.error("Resubmission is not allowed for this assignment.");
      return;
    }
    if (status.submitted && pastDue && status.assignment.allowResubmission) {
      toast.error("Deadline passed — resubmission not allowed.");
      return;
    }

    navigate(`/assignment/${lecture._id}/submit`, {
      state: {
        assignmentTitle: status.assignment.title,
        lectureTitle: lecture.title,
        courseId,
        dueDate: status.assignment.dueDate,
        submitted: status.submitted,
        submissionId: status.submissionId,
      },
    });
  }, [navigate, courseId, lecture, status]);

  const hasDue = Boolean(status.assignment.dueDate);
  const dueLabel = hasDue ? formatDueDate(status.assignment.dueDate) : null;
  const now = Date.now();
  const pastDue = hasDue ? now > new Date(status.assignment.dueDate).getTime() : false;

  const disableSubmit =
    status.loading ||
    status.grade ||
    (status.submitted && !status.assignment.allowResubmission) ||
    (pastDue && status.submitted) ||
    false;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <BookOpen size={18} /> Assignment
      </h3>
      {!status.assignment.fileUrl ? (
        <p className="text-gray-400">No assignment available.</p>
      ) : (
        <div className="bg-[#111] p-4 rounded border border-gray-700 space-y-3 text-gray-200">
          <p className="text-sm font-medium">{status.assignment.title}</p>
          {hasDue && (
            <p className="text-xs text-gray-400">
              <strong>Due Date:</strong> {dueLabel}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={viewAssignment}
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-[#2a2a2a] hover:bg-orange-500 hover:text-black transition"
            >
              View <ExternalLink size={14} />
            </button>

            <button
              type="button"
              disabled={disableSubmit}
              onClick={submitAssignment}
              className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-md transition ${
                disableSubmit
                  ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                  : "bg-[#2a2a2a] hover:bg-green-500 hover:text-black"
              }`}
            >
              {status.submitted ? "Resubmit" : "Submit"} <Upload size={14} />
            </button>
          </div>

          {/* Submitted Files */}
          {status.submitted && status.submissionFiles?.length > 0 && (
            <div className="mt-3 text-xs text-gray-400 border-t border-[#2a2a2a] pt-2">
              <p className="mb-1 text-gray-500">Your Submission:</p>
              <ul className="space-y-1">
                {status.submissionFiles.map((f, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => viewSubmittedFile(f)}
                      className="text-orange-400 hover:underline"
                    >
                      {f.fileName || `File ${idx + 1}`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* --------- SINGLE LECTURE QUIZ --------- */
const SingleLectureQuiz = ({ lecture, quizStatus, navigate }) => {
  const handleQuizAction = async () => {
    try {
      if (quizStatus.attempted) {
        navigate(`/quiz/${lecture._id}/result`);
      } else {
        const quizQuestions = Array.isArray(lecture?.quiz?.questions)
          ? lecture.quiz.questions
          : Array.isArray(lecture?.quiz)
          ? lecture.quiz
          : [];

        navigate(`/quiz/${lecture._id}`, {
          state: {
            questions: quizQuestions,
            timeLimit: lecture?.quiz?.timeLimit || null,
          },
        });
      }
    } catch (err) {
      console.error("Quiz action failed:", err);
      toast.error("Unable to start quiz. Please try again.");
    }
  };

  if (!lecture?.quiz)
    return <p className="text-gray-400">No quiz available.</p>;

  return (
    <div className="bg-[#111] p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <ClipboardList size={18} /> Quiz
      </h3>
      {quizStatus.loading ? (
        <p className="text-gray-400 text-sm">Checking quiz status...</p>
      ) : (
        <button
          onClick={handleQuizAction}
          className={`px-4 py-2 rounded text-white transition ${
            quizStatus.attempted
              ? "bg-green-600 hover:bg-green-700"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {quizStatus.attempted ? "View Result" : "Attempt Quiz"}
        </button>
      )}
    </div>
  );
};

/* --------- CODE REPO BLOCK --------- */
const CodeRepoBlock = ({ repoLink }) => {
  if (!repoLink) return <p className="text-gray-400">No code repository linked.</p>;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Code size={18} /> Code Repository
      </h3>
      <a
        href={repoLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] text-orange-400 rounded hover:bg-[#3d3d3d] transition"
      >
        View Repository <ExternalLink size={14} />
      </a>
    </div>
  );
};

/* ----------------- Helper ----------------- */
function formatDueDate(raw) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}







