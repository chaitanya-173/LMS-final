import React, { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import LectureCard from "./LectureCard";
import ExistingLectureModal from "./ExistingLectureModal";
import { toast } from "react-hot-toast";

// Updated: map API library lecture -> local editor lecture shape (new model)
const mapLibraryLectureToEditor = (lec) => {
  console.log('🔄 Mapping library lecture to editor:', lec);
  
  return {
    id: lec._id || `temp-${crypto.randomUUID()}`,
    title: lec.title || "",
    thumbnail: lec.thumbnail || null,
    video: lec.video || null,
    videoFile: null,
    notes: lec.notes || null,
    assignment: lec.assignment || null,
    quiz: lec.quiz || null,
    codeLink: lec.codeLink || lec.codeUrl || "",
    codeUrl: lec.codeUrl || lec.codeLink || "",
  };
};

// ✅ ENHANCED: Added missing props
const DirectLectureEditor = ({ 
  courseId,           // ✅ NEW: For upload functionality
  onUploadLecture,    // ✅ NEW: Upload handler
  lectures, 
  setLectures, 
  onOpenExtras 
}) => {
  const [showModal, setShowModal] = useState(false);

  // Add empty lecture with new model structure
  const addLecture = () => {
    setLectures((prev) => [
      ...prev,
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
    ]);
  };

  // Add lecture from library with duplicate check
  const addExistingLecture = (lec) => {
    const existsAlready = lectures.some(existingLec => 
      existingLec.id === lec._id || 
      (existingLec.title === lec.title && existingLec.title.trim() !== "")
    );

    if (existsAlready) {
      toast.error("This lecture is already added!");
      return;
    }

    const mapped = mapLibraryLectureToEditor(lec);
    console.log('Adding existing lecture:', { original: lec, mapped });
    setLectures((prev) => [...prev, mapped]);
    toast.success("Lecture added from library!");
    setShowModal(false);
  };

  const updateLecture = (idx, updated) => {
    setLectures((prev) => prev.map((l, i) => (i === idx ? updated : l)));
  };

  const removeLecture = (idx) => {
    setLectures((prev) => prev.filter((_, i) => i !== idx));
  };

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
          <h3 className="font-medium">Lectures</h3>
          {/* ✅ NEW: Lecture count indicator */}
          <span className="text-xs bg-[#3a3936] px-2 py-1 rounded-md text-gray-300">
            {lectures.length} lecture{lectures.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addLecture}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#f35e33] hover:bg-[#ff6f45] rounded-md transition-colors"
          >
            <Plus size={16} /> Add New Lecture
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#3a3936] hover:bg-[#4a4946] rounded-md transition-colors"
          >
            <FolderOpen size={16} /> Add Existing
          </button>
        </div>
      </header>

      <div className="space-y-3">
        {lectures.map((lec, idx) => (
          <LectureCard
            key={`${lec.id}-${idx}`}
            lecture={lec}
            courseId={courseId}              // ✅ NEW: Pass courseId
            onChange={(updated) => updateLecture(idx, updated)}
            onRemove={() => removeLecture(idx)}
            onOpenExtras={onOpenExtras}
            onUploadLecture={onUploadLecture} // ✅ NEW: Pass upload handler
          />
        ))}
        {lectures.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-2">No lectures added yet.</p>
            <p className="text-xs text-gray-500">
              Start by adding a new lecture or selecting from existing ones.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ExistingLectureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={addExistingLecture}
      />
    </section>
  );
};

export default DirectLectureEditor;
