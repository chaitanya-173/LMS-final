import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { useInstructor } from "@/context/InstructorContext";

const ExistingLectureModal = ({ isOpen, onClose, onSelect }) => {
  const { fetchInstructorLectures, instructorLectures, loadingLectures } =
    useInstructor();
  const [initialized, setInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && !initialized) {
      loadLectures();
      setInitialized(true);
    }
  }, [isOpen, initialized]);

  const loadLectures = async () => {
    try {
      await fetchInstructorLectures(); // Fetch all instructor lectures
    } catch (err) {
      console.error("Failed to fetch lectures:", err);
      toast.error("Failed to fetch lectures");
    }
  };

  if (!isOpen) return null;

  // Filter lectures based on search
  const filteredLectures = instructorLectures.filter((lec) =>
    lec.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#1f1d1b] border border-[#3a3936] w-full max-w-xl rounded-lg shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-[#2d2c29]"
        >
          <X size={18} className="text-gray-300" />
        </button>

        <div className="flex items-center justify-start gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white">
            Select Existing Lecture
          </h2>
          {/* Search Bar */}
          <div className="relative w-48">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-sm rounded bg-[#2a2927] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#f35e33]"
            />
            <Search
              size={14}
              className="absolute left-2 top-2.5 text-gray-400"
            />
          </div>
        </div>

        {loadingLectures ? (
          <p className="text-gray-400 text-sm">Loading lectures...</p>
        ) : filteredLectures.length === 0 ? (
          <p className="text-gray-400 text-sm">No lectures found.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture._id}
                className="flex items-center justify-between p-3 bg-[#252523] border border-[#3a3936] rounded-md hover:bg-[#2e2d2b] transition cursor-pointer"
                onClick={() => onSelect({ ...lecture })}
              >
                <p className="font-medium text-white text-sm">
                  {lecture.title}
                </p>
                <span className="text-[#f35e33] text-xs">Select</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExistingLectureModal;
