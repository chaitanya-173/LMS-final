import React, { useRef } from "react";
import {
  Trash2,
  FileText,
  FileVideo,
  Code2,
  PlusCircle,
  XCircle,
  Check,
} from "lucide-react";

const LectureCard = ({ lecture, onChange, onRemove, onOpenExtras }) => {
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Thumbnail change handler: set local preview + file object (for upload)
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...lecture,
        thumbnailFile: file, // local file for upload step
        thumbnail: {
          url: URL.createObjectURL(file), // preview URL
          publicId: file.name, // temp publicId, will replace after actual upload
        },
      });
    }
  };

  // Video change handler: set local file, reset video url (if any)
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...lecture,
        videoFile: file,
        video: {
          url: URL.createObjectURL(file),
          publicId: file.name,
        },
      });
    }
  };

  // Remove thumbnail and associated file reference
  const removeThumbnail = (e) => {
    e.stopPropagation();
    onChange({
      ...lecture,
      thumbnail: null,
      thumbnailFile: null,
    });
  };

  // Remove video and associated file reference
  const removeVideo = (e) => {
    e.stopPropagation();
    onChange({
      ...lecture,
      videoFile: null,
      video: null,
    });
  };

  // Checks for notes, assignments, quiz and code link
  const hasNotes =
    lecture.notes &&
    typeof lecture.notes === "object" &&
    lecture.notes.fileUrl &&
    lecture.notes.fileUrl.trim() !== "";

  const hasAssignment =
    lecture.assignment &&
    typeof lecture.assignment === "object" &&
    lecture.assignment.fileUrl &&
    lecture.assignment.fileUrl.trim() !== "";

  const quizCount = Array.isArray(lecture?.quiz?.questions)
    ? lecture.quiz.questions.length
    : 0;
  const hasQuiz = quizCount > 0;

  const hasCode = lecture.codeLink && lecture.codeLink.trim() !== "";

  return (
    <div className="bg-[#1f1d1b] border border-[#3a3936] rounded-lg p-4 flex flex-col gap-4 shadow-md hover:shadow-lg transition">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          name="title"
          value={lecture.title}
          onChange={(e) => onChange({ ...lecture, title: e.target.value })}
          placeholder="Lecture Title"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
        />
        <button
          onClick={onRemove}
          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-[#2d2c29] rounded transition"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Thumbnail & Video Blocks */}
      <div className="grid grid-cols-2 gap-4">
        {/* Thumbnail */}
        <div
          className="relative h-24 bg-[#2b2a28] border border-[#3a3936] rounded-md overflow-hidden cursor-pointer group"
          onClick={() => thumbnailInputRef.current.click()}
        >
          {lecture.thumbnail && lecture.thumbnail.url ? (
            <img
              src={lecture.thumbnail.url}
              alt="Lecture Thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              Select Thumbnail
            </div>
          )}

          {lecture.thumbnail && lecture.thumbnail.url && (
            <button
              onClick={removeThumbnail}
              className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
            >
              <XCircle size={12} /> Remove
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            ref={thumbnailInputRef}
            onChange={handleThumbnailChange}
            className="hidden"
          />
        </div>

        {/* Video */}
        <div
          className="relative h-24 bg-[#2b2a28] border border-[#3a3936] rounded-md overflow-hidden cursor-pointer group"
          onClick={() => videoInputRef.current.click()}
        >
          {lecture.videoFile ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-white px-2 text-center">
              <FileVideo size={14} className="mr-1" />
              {lecture.videoFile.name}
            </div>
          ) : lecture.video && lecture.video.url ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-white px-2 text-center">
              <FileVideo size={14} className="mr-1" />
              Linked Video
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              Select Lecture Video
            </div>
          )}

          {(lecture.videoFile || (lecture.video && lecture.video.url)) && (
            <button
              onClick={removeVideo}
              className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
            >
              <XCircle size={12} /> Remove
            </button>
          )}

          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={handleVideoChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Extras Buttons (status-aware) */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => onOpenExtras?.(lecture.id, "notes")}
          className="px-3 py-1 bg-[#2d2c29] hover:bg-[#3a3936] rounded flex items-center gap-1 transition"
        >
          {hasNotes ? (
            <>
              <Check size={14} className="text-green-400" /> Notes Added
            </>
          ) : (
            <>
              <PlusCircle size={14} /> Add Notes
            </>
          )}
        </button>

        <button
          onClick={() => onOpenExtras?.(lecture.id, "assignment")}
          className="px-3 py-1 bg-[#2d2c29] hover:bg-[#3a3936] rounded flex items-center gap-1 transition"
        >
          {hasAssignment ? (
            <>
              <Check size={14} className="text-green-400" /> Assignment Added
            </>
          ) : (
            <>
              <FileText size={14} /> Add Assignment
            </>
          )}
        </button>

        <button
          onClick={() => onOpenExtras?.(lecture.id, "quiz")}
          className="px-3 py-1 bg-[#2d2c29] hover:bg-[#3a3936] rounded flex items-center gap-1 transition"
        >
          {hasQuiz ? (
            <>
              <Check size={14} className="text-green-400" /> Quiz ({quizCount})
            </>
          ) : (
            <>
              <PlusCircle size={14} /> Add Quiz
            </>
          )}
        </button>

        <button
          onClick={() => onOpenExtras?.(lecture.id, "code")}
          className="px-3 py-1 bg-[#2d2c29] hover:bg-[#3a3936] rounded flex items-center gap-1 transition"
        >
          {hasCode ? (
            <>
              <Check size={14} className="text-green-400" /> Code Linked
            </>
          ) : (
            <>
              <Code2 size={14} /> Add Code
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LectureCard;
