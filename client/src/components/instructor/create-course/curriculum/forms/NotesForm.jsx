import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FileUp, FileText, X } from "lucide-react";

const NotesForm = ({ lectureId, onSave, existingData = null }) => {
  const [file, setFile] = useState(existingData?.file || null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      return toast.error("Please select a notes file");
    }

    // ✅ Pass data to parent component for local state management
    const notesData = {
      file: file,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file), // Local preview URL
    };

    onSave?.(notesData);
    toast.success("Notes saved!");
  };

  const removeFile = () => {
    setFile(null);
    if (document.getElementById("notes-file")) {
      document.getElementById("notes-file").value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e1e1e] border border-[#2a2826] rounded-xl p-4 space-y-5 text-white"
    >
      {/* File Upload Box */}
      <div>
        <label className="block mb-1 font-medium flex items-center gap-2">
          <FileUp size={18} /> Upload Notes (PDF)*
        </label>
        <div
          className="w-full h-32 border-2 border-dashed border-gray-500 rounded flex items-center justify-center cursor-pointer bg-[#2a2826] hover:border-[#f35e33] transition relative"
          onClick={() => !file && document.getElementById("notes-file").click()}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={24} className="text-[#f35e33]" />
              <span className="text-sm text-center">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Click to select PDF file</span>
          )}
        </div>
        <input
          type="file"
          id="notes-file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
        {file && (
          <button
            type="button"
            onClick={() => document.getElementById("notes-file").click()}
            className="text-xs text-[#f35e33] hover:underline mt-1"
          >
            Change file
          </button>
        )}
      </div>

      {/* File Info */}
      {file && (
        <div className="bg-[#2a2826] p-3 rounded-md">
          <p className="text-xs text-gray-400">Selected file:</p>
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-gray-400">
            Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="bg-[#f35e33] hover:bg-[#e14e27] transition text-white px-4 py-2 rounded w-full font-medium"
        >
          Save Notes
        </button>
      </div>
    </form>
  );
};

export default NotesForm;
