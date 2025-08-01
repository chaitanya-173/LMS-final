import React, { useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "react-hot-toast";
import { CalendarDays, FileUp, FileText, Type } from "lucide-react";

const AssignmentForm = ({ lectureId, onSave }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      return toast.error("Please upload a file");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);

    try {
      setUploading(true);
      const res = await axiosInstance.post(
        `/api/instructor/assignment/upload/${lectureId}`,
        formData
      );

      toast.success("Assignment uploaded successfully");
      onSave?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
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
          <Type size={18} /> Assignment Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter assignment title"
          className="w-full p-2 bg-[#2a2826] rounded outline-none"
        />
      </div>

      {/* File Upload Box */}
      <div>
        <label className="block mb-1 font-medium flex items-center gap-2">
          <FileUp size={18} /> Upload File (PDF)
        </label>
        <div
          className="w-full h-32 border-2 border-dashed border-gray-500 rounded flex items-center justify-center cursor-pointer bg-[#2a2826] hover:border-[#f35e33] transition"
          onClick={() => document.getElementById("assignment-file").click()}
        >
          {file ? (
            <span className="text-sm">{file.name}</span>
          ) : (
            <span className="text-gray-400 text-sm">Click to select file</span>
          )}
        </div>
        <input
          type="file"
          id="assignment-file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
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
          placeholder="Write a short description..."
          className="w-full p-2 bg-[#2a2826] rounded resize-none outline-none"
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
          className="w-full p-2 bg-[#2a2826] rounded outline-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={uploading}
          className="bg-[#f35e33] hover:bg-[#e14e27] transition text-white px-4 py-2 rounded w-full"
        >
          {uploading ? "Uploading..." : "Upload Assignment"}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
