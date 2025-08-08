import React, { useRef, useState } from "react";
import {
  Trash2,
  FileText,
  FileVideo,
  Code2,
  PlusCircle,
  XCircle,
  Check,
  Eye,
  Play,
  Image as ImageIcon,
  Upload,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const LectureCard = ({
  lecture,
  onChange,
  onRemove,
  onOpenExtras,
  courseId,
  onUploadLecture,
}) => {
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({
    open: false,
    type: null,
    url: null,
    name: null, // ✅ Added for PDF name
  });

  // ✅ NEW: PDF Preview Modal State
  const [pdfModal, setPdfModal] = useState({
    open: false,
    url: null,
    fileName: null,
  });

  // Thumbnail change handler
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...lecture,
        thumbnailFile: file,
        thumbnail: {
          url: URL.createObjectURL(file),
          publicId: file.name,
        },
      });
    }
  };

  // Video change handler
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...lecture,
        videoFile: file,
        video: {
          url: URL.createObjectURL(file),
          publicId: file.name,
        },
      });
    }
  };

  // Remove handlers
  const removeThumbnail = (e) => {
    e.stopPropagation();
    onChange({
      ...lecture,
      thumbnail: null,
      thumbnailFile: null,
    });
  };

  const removeVideo = (e) => {
    e.stopPropagation();
    onChange({
      ...lecture,
      videoFile: null,
      video: null,
    });
  };

  // Preview handlers
  const openPreview = (type, url, e) => {
    e.stopPropagation();
    console.log("🔍 Opening preview:", { type, url });
    setPreviewModal({
      open: true,
      type,
      url,
    });
  };

  const closePreview = () => {
    setPreviewModal({
      open: false,
      type: null,
      url: null,
    });
  };

  // ✅ FIXED: Check if lecture has required content for upload
  const canUpload = () => {
    return (
      courseId &&
      lecture.title.trim() !== "" &&
      (lecture.video || lecture.videoFile) // ✅ Only title + video required
    );
  };

  // Check if lecture is already uploaded (has server ID)
  const isUploaded = () => {
    return lecture.id && !lecture.id.startsWith("temp-");
  };

  // ✅ FIXED: Get upload button state with correct messaging
  const getUploadButtonState = () => {
    if (isUploaded()) {
      return {
        text: "✅ Uploaded",
        disabled: true,
        className: "bg-green-600 cursor-not-allowed opacity-75",
        icon: <CheckCircle size={16} />,
      };
    } else if (canUpload()) {
      return {
        text: "📤 Upload Lecture",
        disabled: false,
        className: "bg-blue-600 hover:bg-blue-700 cursor-pointer",
        icon: <Upload size={16} />,
      };
    } else {
      return {
        text: !courseId 
          ? "⚠️ Save Course First" 
          : !lecture.title.trim() 
          ? "⚠️ Add Title First"
          : "⚠️ Add Video First", // ✅ FIXED: Specific message
        disabled: true,
        className: "bg-gray-600 cursor-not-allowed opacity-75",
        icon: <Upload size={16} />,
      };
    }
  };

  // Handle upload lecture
  const handleUploadLecture = () => {
    if (!canUpload()) return;
    onUploadLecture?.(lecture);
  };

  // Has flags with enhanced checking
  const hasNotes =
    lecture.notes &&
    ((typeof lecture.notes === "object" && lecture.notes.fileUrl) ||
      lecture.notesFile);

  const hasAssignment =
    lecture.assignment &&
    ((typeof lecture.assignment === "object" && lecture.assignment.fileUrl) ||
      lecture.assignmentFile);

  const quizCount = Array.isArray(lecture?.quiz?.questions)
    ? lecture.quiz.questions.length
    : 0;
  const hasQuiz = quizCount > 0;

  const hasCode =
    (lecture.codeLink && lecture.codeLink.trim() !== "") ||
    (lecture.codeUrl && lecture.codeUrl.trim() !== "");

  // ✅ FIXED: File viewing handlers - NO NAVIGATION, USE MODAL
  const handleViewFile = (type) => {
    let fileUrl = "";
    let fileName = "";

    if (type === "notes" && lecture.notes?.fileUrl) {
      fileUrl = lecture.notes.fileUrl;
      fileName = lecture.notes.fileName || "Notes.pdf";
    } else if (type === "assignment" && lecture.assignment?.fileUrl) {
      fileUrl = lecture.assignment.fileUrl;
      fileName = lecture.assignment.fileName || "Assignment.pdf";
    }

    if (fileUrl) {
      // ✅ FIXED: Open modal instead of navigation - NO DATA LOSS!
      setPdfModal({
        open: true,
        url: fileUrl,
        fileName: fileName,
      });
    } else {
      alert(`${type} file not available`);
    }
  };

  const handleViewCode = () => {
    const codeUrl = lecture.codeLink || lecture.codeUrl;
    if (codeUrl) {
      window.open(codeUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Code repository not available");
    }
  };

  // ✅ NEW: Close PDF modal
  const closePdfModal = () => {
    setPdfModal({
      open: false,
      url: null,
      fileName: null,
    });
  };

  const buttonState = getUploadButtonState();

  return (
    <>
      <div className="bg-[#1f1d1b] border border-[#3a3936] rounded-lg p-4 flex flex-col gap-4 shadow-md hover:shadow-lg transition">
        {/* Upload Status Indicator */}
        {isUploaded() && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-md p-2 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm text-green-300">
              Lecture uploaded successfully
            </span>
          </div>
        )}

        {/* Title Row */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            name="title"
            value={lecture.title}
            onChange={(e) => onChange({ ...lecture, title: e.target.value })}
            placeholder="Lecture Title*" // ✅ Added required indicator
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
          />
          <button
            onClick={onRemove}
            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-[#2d2c29] rounded transition"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* ✅ ENHANCED: Requirements Guide */}
        <div className="text-xs text-gray-400 bg-[#2a2826] p-2 rounded-md">
          <span className="text-yellow-300">Required:</span> Title + Video | 
          <span className="text-blue-300 ml-2">Optional:</span> Thumbnail, Notes, Assignment, Quiz, Code
        </div>

        {/* Thumbnail & Video Blocks */}
        <div className="grid grid-cols-2 gap-4">
          {/* Thumbnail Block */}
          <div className="relative">
            <div
              className="relative h-28 bg-[#2b2a28] border border-[#3a3936] rounded-md overflow-hidden cursor-pointer group"
              onClick={() => thumbnailInputRef.current.click()}
            >
              {lecture.thumbnail && lecture.thumbnail.url ? (
                <>
                  <img
                    src={lecture.thumbnail.url}
                    alt="Lecture Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) =>
                          openPreview("thumbnail", lecture.thumbnail.url, e)
                        }
                        className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-600 transition"
                        title="Preview Thumbnail"
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <button
                        onClick={removeThumbnail}
                        className="bg-red-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:bg-red-600 transition"
                        title="Remove Thumbnail"
                      >
                        <XCircle size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
                  <ImageIcon size={24} />
                  <span>Thumbnail (Optional)</span>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={thumbnailInputRef}
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>

          {/* Video Block - Enhanced with Required Indicator */}
          <div className="relative">
            <div
              className={`relative h-28 border rounded-md overflow-hidden cursor-pointer group ${
                lecture.videoFile || lecture.video?.url
                  ? "bg-[#2b2a28] border-[#3a3936]"
                  : "bg-[#2b2a28] border-orange-500/50" // ✅ Orange border for required field
              }`}
              onClick={() => videoInputRef.current.click()}
            >
              {lecture.videoFile || (lecture.video && lecture.video.url) ? (
                <>
                  <div className="h-full w-full flex flex-col items-center justify-center text-white px-2 text-center relative">
                    <FileVideo size={24} className="mb-2 text-green-400" />
                    <span className="text-xs font-medium">
                      {lecture.videoFile
                        ? lecture.videoFile.name
                        : "Linked Video"}
                    </span>
                    <Play size={16} className="mt-1 text-green-400" />
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) =>
                          openPreview(
                            "video",
                            lecture.video?.url ||
                              URL.createObjectURL(lecture.videoFile),
                            e
                          )
                        }
                        className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-600 transition"
                        title="Preview Video"
                      >
                        <Play size={12} /> Preview
                      </button>
                      <button
                        onClick={removeVideo}
                        className="bg-red-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:bg-red-600 transition"
                        title="Remove Video"
                      >
                        <XCircle size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
                  <FileVideo size={24} className="text-orange-400" />
                  <span className="text-orange-300">Video (Required)*</span>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* ✅ ENHANCED: Extras Buttons with Better Visual Indicators */}
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Notes */}
          <div className="flex items-center">
            <button
              onClick={() => onOpenExtras?.(lecture.id, "notes")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
                hasNotes
                  ? "bg-green-600/30 border border-green-400/50 text-green-200 shadow-lg"
                  : "bg-[#2d2c29] hover:bg-[#3a3936] text-gray-300 hover:text-white border border-transparent"
              }`}
            >
              {hasNotes ? (
                <>
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="font-medium">Notes Added</span>
                </>
              ) : (
                <>
                  <PlusCircle size={14} />
                  <span>Add Notes</span>
                </>
              )}
            </button>

            {/* ✅ ENHANCED: Preview Button for Notes */}
            {hasNotes && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFile("notes");
                }}
                title="Preview Notes"
                className="ml-1.5 p-1.5 rounded-md hover:bg-[#3a3936] text-blue-400 hover:text-blue-300 transition-all duration-200 border border-blue-500/30"
              >
                <Eye size={14} />
              </button>
            )}
          </div>

          {/* Assignment */}
          <div className="flex items-center">
            <button
              onClick={() => onOpenExtras?.(lecture.id, "assignment")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
                hasAssignment
                  ? "bg-green-600/30 border border-green-400/50 text-green-200 shadow-lg"
                  : "bg-[#2d2c29] hover:bg-[#3a3936] text-gray-300 hover:text-white border border-transparent"
              }`}
            >
              {hasAssignment ? (
                <>
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="font-medium">Assignment Added</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Add Assignment</span>
                </>
              )}
            </button>

            {/* ✅ ENHANCED: Preview Button for Assignment */}
            {hasAssignment && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFile("assignment");
                }}
                title="Preview Assignment"
                className="ml-1.5 p-1.5 rounded-md hover:bg-[#3a3936] text-blue-400 hover:text-blue-300 transition-all duration-200 border border-blue-500/30"
              >
                <Eye size={14} />
              </button>
            )}
          </div>

          {/* Quiz */}
          <button
            onClick={() => onOpenExtras?.(lecture.id, "quiz")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
              hasQuiz
                ? "bg-green-600/30 border border-green-400/50 text-green-200 shadow-lg"
                : "bg-[#2d2c29] hover:bg-[#3a3936] text-gray-300 hover:text-white border border-transparent"
            }`}
          >
            {hasQuiz ? (
              <>
                <CheckCircle size={14} className="text-green-400" />
                <span className="font-medium">Quiz ({quizCount})</span>
              </>
            ) : (
              <>
                <PlusCircle size={14} />
                <span>Add Quiz</span>
              </>
            )}
          </button>

          {/* Code */}
          <div className="flex items-center">
            <button
              onClick={() => onOpenExtras?.(lecture.id, "code")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
                hasCode
                  ? "bg-green-600/30 border border-green-400/50 text-green-200 shadow-lg"
                  : "bg-[#2d2c29] hover:bg-[#3a3936] text-gray-300 hover:text-white border border-transparent"
              }`}
            >
              {hasCode ? (
                <>
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="font-medium">Code Linked</span>
                </>
              ) : (
                <>
                  <Code2 size={14} />
                  <span>Add Code</span>
                </>
              )}
            </button>

            {/* ✅ ENHANCED: Preview Button for Code */}
            {hasCode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCode();
                }}
                title="Open Code Repository"
                className="ml-1.5 p-1.5 rounded-md hover:bg-[#3a3936] text-blue-400 hover:text-blue-300 transition-all duration-200 border border-blue-500/30"
              >
                <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ✅ FIXED: Upload Lecture Button */}
        <div className="flex justify-end pt-3 border-t border-[#3a3936]">
          <div className="flex flex-col items-end gap-2">
            {/* ✅ FIXED: Upload Requirements Status with correct messages */}
            {!isUploaded() && (
              <div className="text-xs text-gray-400">
                {!courseId && (
                  <span className="text-yellow-400">⚠️ Save course first</span>
                )}
                {courseId && !lecture.title.trim() && (
                  <span className="text-yellow-400">⚠️ Add lecture title</span>
                )}
                {courseId && lecture.title.trim() && !(lecture.video || lecture.videoFile) && (
                  <span className="text-yellow-400">⚠️ Add video (required)</span>
                )}
                {canUpload() && (
                  <span className="text-green-400">✅ Ready to upload</span>
                )}
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUploadLecture}
              disabled={buttonState.disabled}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${buttonState.className}`}
              title={
                isUploaded()
                  ? "Lecture already uploaded"
                  : canUpload()
                  ? "Upload this lecture (Title + Video required, other content optional)"
                  : !courseId
                  ? "Save course first to enable uploads"
                  : !lecture.title.trim()
                  ? "Add lecture title first"
                  : "Add video to upload (required field)"
              }
            >
              {buttonState.icon}
              {buttonState.text}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal for Images/Videos */}
      {previewModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={closePreview}
        >
          <div
            className="relative w-[70vw] h-[70vh] bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all"
            >
              <XCircle size={24} />
            </button>

            <div className="w-full h-full">
              {previewModal.type === "video" ? (
                <video
                  src={previewModal.url}
                  controls
                  className="w-full h-full object-contain bg-black"
                  autoPlay={false}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={previewModal.url}
                  alt="Preview"
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: PDF Preview Modal - NO NAVIGATION! */}
      {pdfModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={closePdfModal}
        >
          <div
            className="relative w-[90vw] h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={20} />
                <span className="font-medium">{pdfModal.fileName}</span>
              </div>
              <button
                onClick={closePdfModal}
                className="text-gray-300 hover:text-white p-1 rounded transition"
                title="Close Preview"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* PDF Iframe - Direct PDF Viewer */}
            <div className="w-full h-[calc(90vh-60px)]">
              <iframe
                src={pdfModal.url}
                className="w-full h-full border-none"
                title={pdfModal.fileName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LectureCard;
