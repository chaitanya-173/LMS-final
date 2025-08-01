import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuizStatus } from "@/api/quizApi";
import toast from "react-hot-toast";
import {
  X,
  ChevronDown,
  ChevronUp,
  NotebookPen,
  FileCheck2,
  ListChecks,
  FileCode2,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const LectureAttachmentsModal = ({
  isOpen,
  onClose,
  lecture,
  closeOnBackdrop = true,
}) => {
  const [show, setShow] = useState(false);
  const [quizStatus, setQuizStatus] = useState({
    loading: true,
    attempted: false,
    error: null,
  });

  const navigate = useNavigate();

  /* Anim mount/unmount */
  useEffect(() => {
    if (isOpen) {
      const t = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(t);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  /* ESC to close */
  const handleKey = useCallback((e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      startClose();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  /* Close with animation */
  const startClose = () => {
    setShow(false);
    setTimeout(() => onClose?.(), 200);
  };

  /* Wrapper: close modal THEN navigate/open */
  const closeThen = (fn) => {
    setShow(false);
    setTimeout(() => {
      onClose?.();
      fn?.();
    }, 150);
  };

  /* Quiz click handler with verification */
  const handleQuizClick = async (lectureId) => {
    try {
      const status = await fetchQuizStatus(lectureId);
      if (status?.attempted) {
        toast.error("You have already attempted this quiz.");
        navigate(`/quiz/${lectureId}/result`);
      } else {
        navigate(`/quiz/${lectureId}`, {
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

  /* Fetch Quiz Status when modal opens + quiz exists */
  useEffect(() => {
    if (isOpen && lecture?._id && hasQuiz) {
      setQuizStatus({ loading: true, attempted: false, error: null });

      fetchQuizStatus(lecture._id)
        .then((res) => {
          const normalized = normalizeQuizStatus(res);
          setQuizStatus({ loading: false, ...normalized });
        })
        .catch(() => {
          setQuizStatus({ loading: false, attempted: false, error: true });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lecture?._id]);

  if (!isOpen || !lecture) return null;

  const hasNotes = !!lecture?.notes?.fileUrl;
  const hasAssignment =
    lecture?.assignment &&
    (lecture.assignment.fileUrl || lecture.assignment.title);

  /* -------- QUIZ DETECTION -------- */
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

  const hasQuiz = quizQuestions.length > 0;
  const hasCode = !!lecture?.codeLink;

  const pdfBase = "/pdf-viewer";

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "backdrop-blur-sm transition-opacity duration-200",
        show ? "opacity-100 bg-black/60" : "opacity-0 bg-black/0"
      )}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          startClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={clsx(
          "w-full max-w-md sm:max-w-md",
          "max-h-[90vh] overflow-hidden flex flex-col",
          "bg-[#1f1f1f] text-white rounded-xl shadow-2xl border border-[#2a2a2a]",
          "transform-gpu transition-all duration-200",
          show
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold">
            Attachments{lecture?.title ? ` • ${lecture.title}` : ""}
          </h2>
          <button
            onClick={startClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close attachments"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2a2a]">
          {hasNotes && (
            <ModalSection
              title="Notes"
              icon={<NotebookPen size={16} />}
              defaultOpen
            >
              <AttachmentCard
                label={lecture.notes.fileName || "View Notes"}
                icon={<NotebookPen size={18} />}
                onClick={() =>
                  closeThen(() =>
                    navigate(`${pdfBase}/${lecture._id}/notes`, {
                      state: {
                        fileUrl: lecture.notes.fileUrl,
                        fileName: lecture.notes.fileName,
                      },
                    })
                  )
                }
              />
            </ModalSection>
          )}

          {hasAssignment && (
            <ModalSection
              title="Assignment"
              icon={<FileCheck2 size={16} />}
              defaultOpen={false}
            >
              <AttachmentCard
                label={lecture.assignment.title || "View Assignment"}
                icon={<FileCheck2 size={18} />}
                onClick={() =>
                  closeThen(() =>
                    navigate(`${pdfBase}/${lecture._id}/assignment`, {
                      state: {
                        fileUrl: lecture.assignment.fileUrl,
                        fileName: lecture.assignment.title,
                      },
                    })
                  )
                }
              />
            </ModalSection>
          )}

          {hasQuiz && (
            <ModalSection
              title={`Quiz (${quizQuestions.length})`}
              icon={<ListChecks size={16} />}
              defaultOpen={false}
            >
              {quizStatus.loading ? (
                <div className="text-gray-400 text-sm">Loading status...</div>
              ) : quizStatus.error ? (
                <div className="text-red-400 text-sm">
                  Failed to load quiz status
                </div>
              ) : quizStatus.attempted ? (
                <AttachmentCard
                  label="View Quiz Result"
                  icon={<ListChecks size={18} />}
                  onClick={() => {
                    closeThen(() => navigate(`/quiz/${lecture._id}/result`));
                  }}
                />
              ) : (
                <AttachmentCard
                  label={
                    quizTimeLimit
                      ? `Attempt Quiz • ${formatTimeShort(quizTimeLimit)}`
                      : "Attempt Quiz"
                  }
                  icon={<ListChecks size={18} />}
                  onClick={() => {
                    closeThen(() => handleQuizClick(lecture._id)); // ✅ Check again before navigating
                  }}
                />
              )}
            </ModalSection>
          )}

          {hasCode && (
            <ModalSection
              title="Code Repository"
              icon={<FileCode2 size={16} />}
              defaultOpen={false}
            >
              <AttachmentCard
                label="Open Repository"
                icon={<FileCode2 size={18} />}
                onClick={() =>
                  closeThen(() => window.open(lecture.codeLink, "_blank"))
                }
              />
            </ModalSection>
          )}

          {!hasNotes && !hasAssignment && !hasQuiz && !hasCode && (
            <div className="p-5 text-center text-sm text-gray-400">
              No attachments for this lecture.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureAttachmentsModal;

/* Accordion Section Wrapper */
const ModalSection = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <div
        className={clsx(
          "transition-[max-height,opacity] duration-200 overflow-hidden",
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {open && <div className="px-4 pb-4">{children}</div>}
      </div>
    </div>
  );
};

/* Clickable Attachment Row */
const AttachmentCard = ({ label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between bg-[#2a2a2a] hover:bg-[#3a3a3a] cursor-pointer rounded-md px-3 py-3 mb-2 transition text-left"
  >
    <span className="flex items-center gap-2 text-sm font-medium text-gray-200">
      {icon}
      {label}
    </span>
    <ChevronRight size={18} className="text-gray-400 shrink-0" />
  </button>
);

/* Utils */
function formatTimeShort(sec) {
  if (typeof sec !== "number" || sec <= 0) return "";
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function normalizeQuizStatus(apiRes) {
  if (!apiRes || apiRes.error) return { attempted: false, error: true };

  const payload = apiRes.data ? apiRes.data : apiRes;
  return {
    attempted: Boolean(payload.attempted),
    error: null,
  };
}
