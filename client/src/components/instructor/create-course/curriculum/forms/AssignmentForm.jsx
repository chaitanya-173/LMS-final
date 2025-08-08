import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { CalendarDays, FileUp, FileText, Type, X } from "lucide-react";

const AssignmentForm = ({ lectureId, onSave, existingData = null }) => {
  const [file, setFile] = useState(existingData?.file || null);
  const [title, setTitle] = useState(existingData?.title || "");
  const [description, setDescription] = useState(existingData?.description || "");
  const [dueDate, setDueDate] = useState(existingData?.dueDate || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return toast.error("Please enter assignment title");
    }

    if (!file) {
      return toast.error("Please upload a file");
    }

    // ✅ Pass data to parent component for local state management
    const assignmentData = {
      file: file,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate,
      fileName: file.name,
      fileUrl: file ? URL.createObjectURL(file) : null, // Local preview URL
    };

    onSave?.(assignmentData);
    toast.success("Assignment details saved!");
  };

  const removeFile = () => {
    setFile(null);
    if (document.getElementById("assignment-file")) {
      document.getElementById("assignment-file").value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e1e1e] border border-[#2a2826] rounded-xl p-4 space-y-5 text-white"
    >
      {/* Title */}
      <div>
        <label className="block mb-1 font-medium flex items-center gap-2">
          <Type size={18} /> Assignment Title*
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter assignment title"
          className="w-full p-2 bg-[#2a2826] rounded outline-none focus:ring-2 focus:ring-[#f35e33] transition"
          required
        />
      </div>

      {/* File Upload Box */}
      <div>
        <label className="block mb-1 font-medium flex items-center gap-2">
          <FileUp size={18} /> Upload File (PDF)*
        </label>
        <div
          className="w-full h-32 border-2 border-dashed border-gray-500 rounded flex items-center justify-center cursor-pointer bg-[#2a2826] hover:border-[#f35e33] transition relative"
          onClick={() => !file && document.getElementById("assignment-file").click()}
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
          id="assignment-file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
        {file && (
          <button
            type="button"
            onClick={() => document.getElementById("assignment-file").click()}
            className="text-xs text-[#f35e33] hover:underline mt-1"
          >
            Change file
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 font-medium flex items-center gap-2">
          <FileText size={18} /> Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Write assignment instructions or description..."
          className="w-full p-2 bg-[#2a2826] rounded resize-none outline-none focus:ring-2 focus:ring-[#f35e33] transition"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block mb-1 font-medium flex items-center gap-2">
          <CalendarDays size={18} /> Due Date (optional)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-2 bg-[#2a2826] rounded outline-none focus:ring-2 focus:ring-[#f35e33] transition"
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="bg-[#f35e33] hover:bg-[#e14e27] transition text-white px-4 py-2 rounded w-full font-medium"
        >
          Save Assignment
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
