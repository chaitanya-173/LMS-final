// components/instructor/create-course/curriculum/ChapterBuilder.jsx
import React from "react";
import { Plus } from "lucide-react";
import ChapterItem from "./ChapterItem";

const ChapterBuilder = ({ chapters, setChapters, onOpenExtras }) => {
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
    setChapters((prev) => prev.filter((_, i) => i !== idx));
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
                  videoUrl: "",
                  notes: { title: "", content: "" },
                  assignment: { title: "", dueDate: "", fileUrl: "" },
                  quiz: { title: "", questions: [] },
                },
              ],
            }
          : ch
      )
    );
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

  return (
    <section className="space-y-4 text-white">
      <header className="flex items-center justify-between">
        <h3 className="font-medium">Chapters</h3>
        <button
          type="button"
          onClick={addChapter}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#f35e33] hover:bg-[#ff6f45] rounded-md"
        >
          <Plus size={16} /> New Chapter
        </button>
      </header>

      <div className="space-y-3">
        {chapters.map((ch, cIdx) => (
          <ChapterItem
            key={ch.id}
            chapter={ch}
            onTitleChange={(t) => changeChapterTitle(cIdx, t)}
            onAddLecture={() => addLectureToChapter(cIdx)}
            onUpdateLecture={(lIdx, updated) =>
              updateLecture(cIdx, lIdx, updated)
            }
            onRemoveLecture={(lIdx) => removeLecture(cIdx, lIdx)}
            onRemove={() => removeChapter(cIdx)}
            onOpenExtras={onOpenExtras}
            useLectureCard={true}
          />
        ))}
        {chapters.length === 0 && (
          <p className="text-sm text-gray-400">No chapters added yet.</p>
        )}
      </div>
    </section>
  );
};

export default ChapterBuilder;
