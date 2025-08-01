import React, { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import LectureCard from "./LectureCard";
import ExistingLectureModal from "./ExistingLectureModal";
import { toast } from "react-hot-toast";

// map API library lecture -> local editor lecture shape
const mapLibraryLectureToEditor = (lec) => ({
  id: lec._id || `temp-${crypto.randomUUID()}`,
  title: lec.title || "",
  thumbnail: lec.thumbnailUrl || null,
  videoUrl: lec.videoUrl || null,
  videoFile: null,
  notes: lec.notes || null,
  assignment: lec.assignment || null,
  quiz: lec.quiz || null,
  codeUrl: lec.codeLink || null,
});

const DirectLectureEditor = ({ lectures, setLectures, onOpenExtras }) => {
  const [showModal, setShowModal] = useState(false);

  // Add empty lecture
  const addLecture = () => {
    setLectures((prev) => [
      ...prev,
      {
        id: `temp-${crypto.randomUUID()}`,
        title: "",
        thumbnail: null,
        videoUrl: null,
        videoFile: null,
        notes: null,
        assignment: null,
        quiz: null,
        codeUrl: null,
      },
    ]);
  };

  // Add lecture from library to local state only
  const addExistingLecture = (lec) => {
    const mapped = mapLibraryLectureToEditor(lec);
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
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Lectures</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addLecture}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#f35e33] hover:bg-[#ff6f45] rounded-md"
          >
            <Plus size={16} /> Add New Lecture
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#3a3936] hover:bg-[#4a4946] rounded-md"
          >
            <FolderOpen size={16} /> Add Existing
          </button>
        </div>
      </header>

      <div className="space-y-3">
        {lectures.map((lec, idx) => (
          <LectureCard
            key={lec.id}
            lecture={lec}
            onChange={(updated) => updateLecture(idx, updated)}
            onRemove={() => removeLecture(idx)}
            onOpenExtras={onOpenExtras}
          />
        ))}
        {lectures.length === 0 && (
          <p className="text-sm text-gray-400">No lectures added yet.</p>
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
