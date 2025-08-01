import React from "react";
import { Trash2, GripVertical } from "lucide-react";
import LectureCard from "./LectureCard"; // update path if needed

const ChapterItem = ({
  chapter,
  onTitleChange,
  onAddLecture,
  onUpdateLecture,
  onRemoveLecture,
  onRemove,
  onOpenExtras,       // 🔥 NEW for notes/quiz etc
  useLectureCard = false, // toggle card vs simple
}) => {
  const handleLectureChange = (idx, updated) => {
    onUpdateLecture(idx, updated);
  };

  return (
    <div className="bg-[#1f1d1b] border border-[#3a3936] rounded-md p-3 space-y-2">
      {/* Chapter Header */}
      <div className="flex items-center gap-3">
        <GripVertical size={16} className="text-gray-500" />
        <input
          value={chapter.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Chapter title"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={onAddLecture}
          className="p-1 text-xs rounded bg-[#2d2c29] hover:bg-[#3a3835]"
        >
          + Lesson
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded hover:bg-[#2d2c29] text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Lectures */}
      <div className="pl-8 space-y-2">
        {chapter.lectures.map((lec, idx) =>
          useLectureCard ? (
            <LectureCard
              key={lec.id}
              lecture={lec}
              onChange={(updatedLecture) => handleLectureChange(idx, updatedLecture)}
              onRemove={() => onRemoveLecture(idx)}
              onOpenExtras={onOpenExtras}
            />
          ) : (
            <div
              key={lec.id}
              className="flex items-center gap-3 bg-[#252523] border border-[#3a3936] rounded-md p-2"
            >
              <GripVertical size={14} className="text-gray-500" />
              <input
                name="title"
                value={lec.title}
                onChange={(e) =>
                  handleLectureChange(idx, {
                    ...lec,
                    title: e.target.value,
                  })
                }
                placeholder="Lesson title"
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                name="videoUrl"
                value={lec.videoUrl}
                onChange={(e) =>
                  handleLectureChange(idx, {
                    ...lec,
                    videoUrl: e.target.value,
                  })
                }
                placeholder="Video URL"
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onRemoveLecture(idx)}
                className="p-1 rounded hover:bg-[#2d2c29] text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        )}

        {chapter.lectures.length === 0 && (
          <p className="text-xs text-gray-500 pl-5">No lessons yet.</p>
        )}
      </div>
    </div>
  );
};

export default ChapterItem;
