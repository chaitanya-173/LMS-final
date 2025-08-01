import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NotebookPen, Search, FileText, ExternalLink } from "lucide-react";
import { useCourse } from "@/context/CourseContext";

const CourseNotesContent = ({ allLectures }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { currentCourseDetails } = useCourse() ?? {};

  const [search, setSearch] = useState("");

  // Extract notes from lectures
  const notes = useMemo(() => {
    return (allLectures || [])
      .filter((lec) => lec.notes?.fileUrl)
      .map((lec) => ({
        lectureId: lec._id,
        lectureTitle: lec.title,
        fileName: lec.notes.fileName || "Notes.pdf",
        fileUrl: lec.notes.fileUrl,
      }));
  }, [allLectures]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.lectureTitle.toLowerCase().includes(q) ||
        n.fileName.toLowerCase().includes(q)
    );
  }, [search, notes]);

  const openNote = (note) => {
    navigate(`/pdf-viewer/${note.lectureId}/notes`, {
      state: {
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        lectureTitle: note.lectureTitle,
        courseId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen size={20} className="text-[#3a9aed]" />
          <h1 className="text-2xl font-semibold">
            {currentCourseDetails?.title
              ? `${currentCourseDetails.title} • Notes`
              : "Course Notes"}
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-[#3a9aed]"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-16 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-gray-500 text-sm">
            No notes found.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note) => (
              <li
                key={note.lectureId}
                className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a9aed] hover:shadow-lg transition cursor-pointer"
                onClick={() => openNote(note)}
              >
                <div className="flex items-start gap-2 mb-3">
                  <FileText
                    size={20}
                    className="text-[#3a9aed] mt-[2px] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {note.fileName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {note.lectureTitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNote(note);
                  }}
                  className="mt-auto inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-[#2a2a2a] group-hover:bg-[#3a9aed] group-hover:text-black transition"
                >
                  Open
                  <ExternalLink size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseNotesContent;
