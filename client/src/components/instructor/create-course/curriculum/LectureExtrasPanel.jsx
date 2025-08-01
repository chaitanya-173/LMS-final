import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import NotesForm from "./forms/NotesForm";
import AssignmentForm from "./forms/AssignmentForm";
import QuizForm from "./forms/QuizForm";
import CodeLinkForm from "./forms/CodeLinkForm";

const LectureExtrasPanel = ({ open, lectureId, type, onClose, onSave }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open || !lectureId) return;
    // fetch or set lecture-specific data if needed
    setData(null); // reset before opening
  }, [open, lectureId]);

  if (!open) return null;

  const renderForm = () => {
    switch (type) {
      case "notes":
        return <NotesForm lectureId={lectureId} onSave={onSave} />;
      case "assignment":
        return <AssignmentForm lectureId={lectureId} onSave={onSave} />;
      case "quiz":
        return <QuizForm lectureId={lectureId} onSave={onSave} />;
      case "code":
        return <CodeLinkForm lectureId={lectureId} onSave={onSave} />;
      default:
        return <div className="text-white">Invalid type</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative w-[90%] max-w-5xl h-[90%] bg-[#1f1d1b] border border-[#2a2826] p-6 overflow-y-auto rounded-xl z-10">
        <button
          className="absolute top-4 right-4 p-2 rounded hover:bg-[#2a2826]"
          onClick={onClose}
        >
          <X size={20} className="text-gray-300" />
        </button>
        <h2 className="text-xl font-semibold text-white capitalize mb-4">
          Edit {type}
        </h2>

        {renderForm()}
      </div>
    </div>
  );
};

export default LectureExtrasPanel;
