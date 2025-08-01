import React, { useState } from "react";
import DirectLectureEditor from "../curriculum/DirectLectureEditor";
import ChapterBuilder from "../curriculum/ChapterBuilder";
import LectureExtrasPanel from "../curriculum/LectureExtrasPanel";

const CurriculumTab = ({
  hasDirectLectures,
  setHasDirectLectures,
  lectures,
  setLectures,
  chapters,
  setChapters,
}) => {
  const [extrasPanel, setExtrasPanel] = useState({
    open: false,
    lectureId: null,
    type: null,
  });

  const handleOpenExtras = (lectureId, type) => {
    setExtrasPanel({ open: true, lectureId, type });
  };

  return (
    <div className="space-y-8 text-white">
      {/* Mode Toggle */}
      <section className="bg-[#252523] rounded-md p-6 space-y-4 shadow-md">
        <h2 className="text-xl font-semibold text-white">Course Structure</h2>
        <p className="text-sm text-gray-400">
          Choose how you want to organize your course content.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => setHasDirectLectures(true)}
            className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
              hasDirectLectures
                ? "bg-[#f35e33] text-white border-[#f35e33]"
                : "bg-transparent text-gray-300 border-[#3a3a37] hover:border-[#f35e33] hover:text-white"
            }`}
          >
            Direct Lectures (no chapters)
          </button>

          <button
            type="button"
            onClick={() => setHasDirectLectures(false)}
            className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
              !hasDirectLectures
                ? "bg-[#f35e33] text-white border-[#f35e33]"
                : "bg-transparent text-gray-300 border-[#3a3a37] hover:border-[#f35e33] hover:text-white"
            }`}
          >
            Chapters → Lectures
          </button>
        </div>
      </section>

      {/* Builder Section */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6">
        {hasDirectLectures ? (
          <DirectLectureEditor
            lectures={lectures}
            setLectures={setLectures}
            onOpenExtras={handleOpenExtras}
          />
        ) : (
          <ChapterBuilder
            chapters={chapters}
            setChapters={setChapters}
            onOpenExtras={handleOpenExtras}
          />
        )}
      </section>

      {/* Extras Panel */}
      <LectureExtrasPanel
        open={extrasPanel.open}
        lectureId={extrasPanel.lectureId}
        type={extrasPanel.type}
        onClose={() =>
          setExtrasPanel({ open: false, lectureId: null, type: null })
        }
      />
    </div>
  );
};

export default CurriculumTab;
