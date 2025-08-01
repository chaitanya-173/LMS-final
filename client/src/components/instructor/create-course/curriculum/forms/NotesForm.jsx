import React, { useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "react-hot-toast";
import { FileUp } from "lucide-react";

const NotesForm = ({ lectureId, onSave }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      return toast.error("Please select a notes file");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axiosInstance.post(
        `/api/instructor/notes/upload/${lectureId}`,
        formData
      );

      toast.success("Notes uploaded successfully");
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
      {/* File Upload Box */}
      <div>
        <label className="block mb-1 font-medium flex items-center gap-2">
          <FileUp size={18} /> Upload Notes (PDF)
        </label>
        <div
          className="w-full h-32 border-2 border-dashed border-gray-500 rounded flex items-center justify-center cursor-pointer bg-[#2a2826] hover:border-[#f35e33] transition"
          onClick={() => document.getElementById("notes-file").click()}
        >
          {file ? (
            <span className="text-sm">{file.name}</span>
          ) : (
            <span className="text-gray-400 text-sm">Click to select file</span>
          )}
        </div>
        <input
          type="file"
          id="notes-file"
          accept=".pdf,"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={uploading}
          className="bg-[#f35e33] hover:bg-[#e14e27] transition text-white px-4 py-2 rounded w-full"
        >
          {uploading ? "Uploading..." : "Upload Notes"}
        </button>
      </div>
    </form>
  );
};

export default NotesForm;
