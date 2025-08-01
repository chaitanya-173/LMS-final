import { useNavigate, useParams } from "react-router-dom";
import React, { useMemo } from "react";
import { Play, Paperclip, Clock, CalendarDays } from "lucide-react";

/**
 * Student-side LectureCard — view only (no file upload).
 * Assumes lecture.thumbnail can be an object ({url, publicId}) per new model,
 * or a string (for old compat).
 */
const LectureCard = ({
  lecture,
  _id,
  title,
  thumbnail,
  duration,
  date,
  notes,
  assignment,
  quiz,
  codeLink,
  progress = 0,
  isCompleted,
  onPlay,
  onAttachments,
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Merge data priority: explicit prop > lecture.field
  const data = useMemo(() => {
    const l = lecture || {};
    return {
      _id: _id ?? l._id,
      title: title ?? l.title,
      thumbnailUrl:
        (typeof thumbnail === "string" ? thumbnail : thumbnail?.url) ??
        l.thumbnail?.url ??
        l.thumbnailUrl, // Support string or object, fallback to old for max compat
      uploadDate: date ?? l.uploadDate ?? l.createdAt,
      duration: duration ?? l.duration,
      notes: notes ?? l.notes,
      assignment: assignment ?? l.assignment,
      quiz: quiz ?? l.quiz,
      codeLink: codeLink ?? l.codeLink,
    };
  }, [
    lecture,
    _id,
    title,
    thumbnail,
    duration,
    date,
    notes,
    assignment,
    quiz,
    codeLink,
  ]);

  const {
    _id: lectureId,
    title: t,
    thumbnailUrl,
    uploadDate,
    duration: dur,
    notes: n,
    assignment: a,
    quiz: q,
    codeLink: c,
  } = data;

  // Detect attachments
  const hasAttachments =
    (n && n.fileUrl) ||
    (a && (a.fileUrl || a.title || a.description)) ||
    (q && Array.isArray(q?.questions) && q.questions.length > 0) ||
    !!c;

  // Fallback display for date & duration
  const displayDate = uploadDate
    ? new Date(uploadDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const displayDuration = formatDuration(dur);

  // Handlers
  const handlePlay = () => {
    if (onPlay) return onPlay();
    if (!lectureId) return;
    navigate(`/my-courses/${courseId}/player?lectureId=${lectureId}`);
  };

  const handleAttachments = () => {
    if (onAttachments) return onAttachments();
    // No fallback action — could toast "No attachments view wired."
  };

  return (
    <div
      className="relative w-full max-w-[300px] bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg shadow-md hover:shadow-lg hover:border-[#3a9aed] transition overflow-hidden text-white"
      role="group"
    >
      {/* Progress strip (top) */}
      <div
        className="absolute top-0 left-0 h-[3px] bg-orange-500 transition-all"
        style={{ width: `${progress}%` }}
      />

      {/* Thumbnail */}
      <button
        type="button"
        onClick={handlePlay}
        className="block w-full relative focus:outline-none"
      >
        <img
          src={
            thumbnailUrl ||
            "https://picsum.photos/seed/lecturefallback/400/250"
          }
          alt={t}
          className="w-full h-40 object-cover"
        />

        {/* PW-style play: solid circle + thin white border + triangle */}
        <span
          className="absolute bottom-3 right-3 inline-flex items-center justify-center
              w-10 h-10 rounded-full bg-[#2563eb] border-2 border-white
              shadow-lg hover:scale-110 transition-transform"
        >
          <Play
            size={22}
            className="text-white translate-x-[1px]" // nudge triangle visually center
          />
        </span>
      </button>

      {/* Meta + actions */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <button
          type="button"
          onClick={handlePlay}
          className="block w-full text-sm font-medium text-left leading-tight line-clamp-2 hover:text-orange-400"
          title={t}
        >
          {t}
        </button>

        {/* Date + Duration row */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} />
            {displayDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {displayDuration}
          </span>
        </div>

        {/* Footer row: completed + attachments */}
        <div className="flex items-center justify-between pt-1">
          {/* Attachments */}
          {hasAttachments ? (
            <button
              type="button"
              onClick={handleAttachments}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-[#353a3c] hover:border-orange-500 hover:text-orange-400 transition"
            >
              <Paperclip size={14} />
              Attachments
            </button>
          ) : (
            <span className="text-[11px] text-gray-500">No attachments</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureCard;

/* ----------------- helpers ----------------- */

// Accepts seconds, "HH:MM:SS", ms, or undefined
function formatDuration(raw) {
  if (!raw && raw !== 0) return "00:00";

  // Already a formatted string (contains :) – trust it
  if (typeof raw === "string" && raw.includes(":")) return raw;

  // If ms or seconds numeric
  const seconds = Number(raw);
  if (Number.isNaN(seconds)) return "00:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
