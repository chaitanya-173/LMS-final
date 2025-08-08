import React, { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import ChapterItem from "./ChapterItem";
import ExistingLectureModal from "./ExistingLectureModal";
import { toast } from "react-hot-toast";

// ✅ ENHANCED: Added missing props
const ChapterBuilder = ({ 
  courseId,           // ✅ NEW: For upload functionality
  onUploadLecture,    // ✅ NEW: Upload handler
  chapters, 
  setChapters, 
  onOpenExtras 
}) => {
  const [existingLectureModal, setExistingLectureModal] = useState({
    open: false,
    targetChapterIndex: null,
  });

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        id: `temp-${crypto.randomUUID()}`,
        title: "",
        lectures: [],
      },
    ]);
  };

  const removeChapter = (idx) => {
    if (window.confirm('Are you sure you want to delete this chapter and all its lectures?')) {
      setChapters((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const changeChapterTitle = (idx, title) => {
    setChapters((prev) =>
      prev.map((ch, i) => (i === idx ? { ...ch, title } : ch))
    );
  };

  const addLectureToChapter = (idx) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i === idx
          ? {
              ...ch,
              lectures: [
                ...ch.lectures,
                {
                  id: `temp-${crypto.randomUUID()}`,
                  title: "",
                  thumbnail: null,
                  video: null,
                  videoFile: null,
                  notes: null,
                  assignment: null,
                  quiz: null,
                  codeLink: "",
                  codeUrl: "",
                },
              ],
            }
          : ch
      )
    );
  };

  const openExistingLectureModal = (chapterIndex) => {
    console.log('🔍 Opening existing lecture modal for chapter index:', chapterIndex);
    setExistingLectureModal({
      open: true,
      targetChapterIndex: chapterIndex,
    });
  };

  const addExistingLectureToChapter = (libraryLecture) => {
    const { targetChapterIndex } = existingLectureModal;
    
    if (targetChapterIndex === null || targetChapterIndex === undefined) {
      toast.error('No target chapter selected');
      return;
    }

    const targetChapter = chapters[targetChapterIndex];
    const existsInChapter = targetChapter.lectures.some(
      lec => lec.id === libraryLecture._id || 
      (lec.title === libraryLecture.title && lec.title.trim() !== "")
    );

    if (existsInChapter) {
      toast.error('This lecture is already added to this chapter!');
      return;
    }

    const mappedLecture = {
      id: libraryLecture._id || `temp-${crypto.randomUUID()}`,
      title: libraryLecture.title || "",
      thumbnail: libraryLecture.thumbnail || null,
      video: libraryLecture.video || null,
      videoFile: null,
      notes: libraryLecture.notes || null,
      assignment: libraryLecture.assignment || null,
      quiz: libraryLecture.quiz || null,
      codeLink: libraryLecture.codeLink || libraryLecture.codeUrl || "",
      codeUrl: libraryLecture.codeUrl || libraryLecture.codeLink || "",
    };

    console.log('➕ Adding existing lecture to chapter:', { 
      targetChapterIndex, 
      lectureTitle: mappedLecture.title,
      chapterTitle: targetChapter.title
    });

    setChapters(prev => prev.map((ch, i) => 
      i === targetChapterIndex 
        ? { ...ch, lectures: [...ch.lectures, mappedLecture] }
        : ch
    ));

    toast.success(`Lecture added to "${targetChapter.title}" successfully!`);
    setExistingLectureModal({ open: false, targetChapterIndex: null });
  };

  const updateLecture = (cIdx, lIdx, updatedLecture) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i === cIdx
          ? {
              ...ch,
              lectures: ch.lectures.map((lec, ii) =>
                ii === lIdx ? updatedLecture : lec
              ),
            }
          : ch
      )
    );
  };

  const removeLecture = (cIdx, lIdx) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i === cIdx
          ? {
              ...ch,
              lectures: ch.lectures.filter((_, ii) => ii !== lIdx),
            }
          : ch
      )
    );
  };

  // ✅ NEW: Calculate total lectures across all chapters
  const totalLectures = chapters.reduce((total, ch) => total + ch.lectures.length, 0);

  return (
    <section className="space-y-4 text-white">
      {/* ✅ NEW: Course Status Check */}
      {!courseId && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-300">
            💡 Save course as draft first to enable lecture uploads
          </span>
        </div>
      )}

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">Chapters</h3>
          {/* ✅ NEW: Chapter and lecture count indicators */}
          <div className="flex gap-2">
            <span className="text-xs bg-[#3a3936] px-2 py-1 rounded-md text-gray-300">
              {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
            </span>
            {totalLectures > 0 && (
              <span className="text-xs bg-[#f35e33] px-2 py-1 rounded-md text-white">
                {totalLectures} total lecture{totalLectures !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={addChapter}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#f35e33] hover:bg-[#ff6f45] rounded-md transition-colors"
        >
          <Plus size={16} /> New Chapter
        </button>
      </header>

      <div className="space-y-3">
        {chapters.map((ch, cIdx) => (
          <ChapterItem
            key={ch.id}
            chapter={ch}
            courseId={courseId}                    // ✅ NEW: Pass courseId
            onTitleChange={(t) => changeChapterTitle(cIdx, t)}
            onAddLecture={() => addLectureToChapter(cIdx)}
            onUpdateLecture={(lIdx, updated) =>
              updateLecture(cIdx, lIdx, updated)
            }
            onRemoveLecture={(lIdx) => removeLecture(cIdx, lIdx)}
            onRemove={() => removeChapter(cIdx)}
            onOpenExtras={onOpenExtras}
            onUploadLecture={onUploadLecture}      // ✅ NEW: Pass upload handler
            useLectureCard={true}
            onAddExistingLecture={() => openExistingLectureModal(cIdx)}
          />
        ))}
        {chapters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-2">No chapters added yet.</p>
            <p className="text-xs text-gray-500">
              Create chapters to organize your course content into logical sections.
            </p>
          </div>
        )}
      </div>

      <ExistingLectureModal
        isOpen={existingLectureModal.open}
        onClose={() => setExistingLectureModal({ open: false, targetChapterIndex: null })}
        onSelect={addExistingLectureToChapter}
      />
    </section>
  );
};

export default ChapterBuilder;
