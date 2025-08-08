import React from "react";
import { Trash2, GripVertical, Plus, FolderOpen, Upload, CheckCircle } from "lucide-react";
import LectureCard from "./LectureCard";

const ChapterItem = ({
  chapter,
  courseId,              // ✅ NEW: For upload functionality
  onTitleChange,
  onAddLecture,
  onUpdateLecture,
  onRemoveLecture,
  onRemove,
  onOpenExtras,
  onUploadLecture,       // ✅ NEW: Upload handler
  onAddExistingLecture,  // Handler for adding existing lectures
  useLectureCard = false,
}) => {
  const handleLectureChange = (idx, updated) => {
    onUpdateLecture(idx, updated);
  };

  // ✅ NEW: Calculate chapter statistics
  const getChapterStats = () => {
    const totalLectures = chapter.lectures.length;
    const uploadedLectures = chapter.lectures.filter(lec => 
      lec.id && !lec.id.startsWith('temp-')
    ).length;
    const lecturesWithContent = chapter.lectures.filter(lec =>
      lec.title.trim() && (lec.video || lec.thumbnail || lec.notes || lec.assignment || lec.quiz || lec.codeLink)
    ).length;

    return { totalLectures, uploadedLectures, lecturesWithContent };
  };

  // ✅ NEW: Handle upload all lectures in chapter
  const handleUploadAllLectures = () => {
    const readyLectures = chapter.lectures.filter(lec => {
      const hasTitle = lec.title.trim() !== "";
      const hasContent = lec.thumbnail || lec.video || lec.notes || lec.assignment || lec.quiz || lec.codeLink;
      const notUploaded = !lec.id || lec.id.startsWith('temp-');
      return hasTitle && hasContent && notUploaded;
    });

    if (readyLectures.length === 0) {
      toast.error("No lectures ready for upload in this chapter");
      return;
    }

    readyLectures.forEach(lecture => {
      onUploadLecture?.(lecture);
    });
  };

  const stats = getChapterStats();

  return (
    <div className="bg-[#1f1d1b] border border-[#3a3936] rounded-md p-3 space-y-3">
      {/* ✅ ENHANCED: Chapter Header with Better Analytics */}
      <div className="flex items-center gap-3">
        <GripVertical size={16} className="text-gray-500" />
        <input
          value={chapter.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Chapter title"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
        />
        
        {/* ✅ ENHANCED: Better chapter statistics */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">
            {stats.totalLectures} lecture{stats.totalLectures !== 1 ? 's' : ''}
          </span>
          {stats.uploadedLectures > 0 && (
            <span className="text-green-400 bg-green-900/20 px-2 py-1 rounded">
              ✅ {stats.uploadedLectures} uploaded
            </span>
          )}
          {stats.lecturesWithContent > stats.uploadedLectures && (
            <span className="text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
              📦 {stats.lecturesWithContent - stats.uploadedLectures} ready
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded hover:bg-[#2d2c29] text-red-400 transition-colors"
          title="Delete Chapter"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* ✅ ENHANCED: Lecture Actions with Upload All */}
      <div className="flex gap-2 pl-5">
        <button
          type="button"
          onClick={onAddLecture}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#f35e33] hover:bg-[#ff6f45] rounded-md transition-colors"
        >
          <Plus size={14} /> Add New Lecture
        </button>
        
        {/* Add Existing Lecture Button */}
        {onAddExistingLecture && (
          <button
            type="button"
            onClick={onAddExistingLecture}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#3a3936] hover:bg-[#4a4946] rounded-md transition-colors"
          >
            <FolderOpen size={14} /> Add Existing
          </button>
        )}

        {/* ✅ NEW: Upload All Lectures in Chapter */}
        {courseId && stats.lecturesWithContent > stats.uploadedLectures && (
          <button
            type="button"
            onClick={handleUploadAllLectures}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded-md transition-colors ml-auto"
            title={`Upload ${stats.lecturesWithContent - stats.uploadedLectures} ready lecture(s)`}
          >
            <Upload size={14} /> Upload All ({stats.lecturesWithContent - stats.uploadedLectures})
          </button>
        )}
      </div>

      {/* ✅ ENHANCED: Course Status Indicator for Chapter */}
      {!courseId && chapter.lectures.length > 0 && (
        <div className="pl-5">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-md p-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-yellow-300">
              💡 Save course as draft to enable lecture uploads for this chapter
            </span>
          </div>
        </div>
      )}

      {/* Lectures */}
      <div className="pl-5 space-y-3">
        {chapter.lectures.map((lec, idx) =>
          useLectureCard ? (
            <LectureCard
              key={`${lec.id}-${idx}`}
              lecture={lec}
              courseId={courseId}                    // ✅ NEW: Pass courseId
              onChange={(updatedLecture) => handleLectureChange(idx, updatedLecture)}
              onRemove={() => onRemoveLecture(idx)}
              onOpenExtras={onOpenExtras}
              onUploadLecture={onUploadLecture}      // ✅ NEW: Pass upload handler
            />
          ) : (
            // ✅ ENHANCED: Simple mode with upload indicators
            <div
              key={`${lec.id}-${idx}`}
              className="flex items-center gap-3 bg-[#252523] border border-[#3a3936] rounded-md p-3 hover:bg-[#2a2826] transition-colors"
            >
              <GripVertical size={14} className="text-gray-500" />
              
              {/* ✅ NEW: Upload status indicator */}
              <div className="flex items-center">
                {lec.id && !lec.id.startsWith('temp-') ? (
                  <CheckCircle size={14} className="text-green-400" title="Uploaded" />
                ) : courseId && lec.title.trim() && (lec.video || lec.thumbnail || lec.notes || lec.assignment || lec.quiz || lec.codeLink) ? (
                  <Upload size={14} className="text-blue-400" title="Ready to upload" />
                ) : (
                  <div className="w-4 h-4" /> // Spacer
                )}
              </div>

              <input
                name="title"
                value={lec.title}
                onChange={(e) =>
                  handleLectureChange(idx, {
                    ...lec,
                    title: e.target.value,
                  })
                }
                placeholder="Lecture title"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
              />
              
              {/* Video status */}
              <div className="text-xs text-gray-400 min-w-[80px]">
                {lec.video?.url ? (
                  <span className="text-green-400">📹 Video Added</span>
                ) : lec.videoUrl ? (
                  <span className="text-blue-400">🔗 URL Added</span>
                ) : (
                  <span className="text-gray-500">No Video</span>
                )}
              </div>

              {/* ✅ ENHANCED: Better attachments display */}
              <div className="text-xs text-gray-400 min-w-[60px]">
                {(() => {
                  const attachments = [
                    lec.notes && '📄',
                    lec.assignment && '📝', 
                    lec.quiz?.questions?.length > 0 && '❓',
                    lec.codeLink && '💻'
                  ].filter(Boolean);
                  
                  return attachments.length > 0 ? (
                    <span className="text-yellow-400" title={`${attachments.length} attachment(s)`}>
                      {attachments.join('')} {attachments.length}
                    </span>
                  ) : null;
                })()}
              </div>

              {/* ✅ NEW: Quick upload button for simple mode */}
              {courseId && lec.title.trim() && 
               (lec.video || lec.thumbnail || lec.notes || lec.assignment || lec.quiz || lec.codeLink) && 
               (!lec.id || lec.id.startsWith('temp-')) && (
                <button
                  type="button"
                  onClick={() => onUploadLecture?.(lec)}
                  className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors text-white"
                  title="Upload this lecture"
                >
                  📤
                </button>
              )}

              <button
                type="button"
                onClick={() => onRemoveLecture(idx)}
                className="p-1 rounded hover:bg-[#2d2c29] text-red-400 transition-colors"
                title="Delete Lecture"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        )}

        {chapter.lectures.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No lectures in this chapter yet.</p>
            <p className="text-xs mt-1">Click "Add New Lecture" or "Add Existing" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterItem;
