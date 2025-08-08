import React, { useState } from "react";
import DirectLectureEditor from "../curriculum/DirectLectureEditor";
import ChapterBuilder from "../curriculum/ChapterBuilder";
import LectureExtrasPanel from "../curriculum/LectureExtrasPanel";
import { toast } from "react-hot-toast";
import axios from "@/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";

const CurriculumTab = ({
  courseId, // ✅ courseId for uploads
  hasDirectLectures,
  setHasDirectLectures,
  lectures,
  setLectures,
  chapters,
  setChapters,
}) => {
  const { token } = useAuth();

  // Debug props
  console.log('📚 CurriculumTab received:', {
    courseId,
    hasDirectLectures,
    lecturesCount: lectures?.length || 0,
    chaptersCount: chapters?.length || 0,
    lecturesData: lectures,
    chaptersData: chapters,
  });

  const [extrasPanel, setExtrasPanel] = useState({
    open: false,
    lectureId: null,
    type: null,
  });

  // ✅ NEW: Upload progress tracking
  const [uploadProgress, setUploadProgress] = useState({});

  const handleOpenExtras = (lectureId, type) => {
    console.log('🔧 Opening extras panel:', { lectureId, type });
    setExtrasPanel({ open: true, lectureId, type });
  };

  // ✅ ENHANCED: Handle saving lecture extras with proper data structure
  const handleLectureExtrasSave = (lectureId, type, data) => {
    console.log('💾 Saving lecture extras:', { lectureId, type, data });

    if (hasDirectLectures) {
      // ✅ Update direct lectures with proper data structure
      setLectures((prev) =>
        prev.map((lec) =>
          lec.id === lectureId
            ? {
                ...lec,
                // ✅ Save data based on type with proper structure
                ...(type === 'notes' && {
                  notes: {
                    fileName: data.fileName,
                    fileUrl: data.fileUrl, // Local preview URL
                  },
                  notesFile: data.file // Store file for upload
                }),
                ...(type === 'assignment' && {
                  assignment: {
                    title: data.title,
                    description: data.description,
                    dueDate: data.dueDate,
                    fileName: data.fileName,
                    fileUrl: data.fileUrl, // Local preview URL
                  },
                  assignmentFile: data.file // Store file for upload
                }),
                ...(type === 'quiz' && {
                  quiz: {
                    timeLimit: data.timeLimit,
                    questions: data.questions
                  }
                }),
                ...(type === 'code' && {
                  codeLink: data.codeLink,
                  codeUrl: data.codeLink // Backward compatibility
                })
              }
            : lec
        )
      );
    } else {
      // ✅ Update chapter lectures with proper data structure
      setChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          lectures: ch.lectures.map((lec) =>
            lec.id === lectureId
              ? {
                  ...lec,
                  // ✅ Same data structure as above
                  ...(type === 'notes' && {
                    notes: {
                      fileName: data.fileName,
                      fileUrl: data.fileUrl,
                    },
                    notesFile: data.file
                  }),
                  ...(type === 'assignment' && {
                    assignment: {
                      title: data.title,
                      description: data.description,
                      dueDate: data.dueDate,
                      fileName: data.fileName,
                      fileUrl: data.fileUrl,
                    },
                    assignmentFile: data.file
                  }),
                  ...(type === 'quiz' && {
                    quiz: {
                      timeLimit: data.timeLimit,
                      questions: data.questions
                    }
                  }),
                  ...(type === 'code' && {
                    codeLink: data.codeLink,
                    codeUrl: data.codeLink
                  })
                }
              : lec
          ),
        }))
      );
    }

    console.log('✅ Lecture extras saved successfully');
  };

  // ✅ NEW: Single file upload function
  const uploadFileToServer = async (file, fileType, lectureId) => {
    if (!file) throw new Error('No file provided');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/utils/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        // ✅ Progress tracking for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`${fileType} upload progress: ${percentCompleted}%`);
          
          // Update progress state
          setUploadProgress(prev => ({
            ...prev,
            [lectureId]: {
              ...prev[lectureId],
              [fileType]: percentCompleted
            }
          }));
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Upload failed');
      }

      return {
        url: response.data.url,
        publicId: response.data.publicId,
        originalName: response.data.originalName,
        size: response.data.size
      };

    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(`${fileType} upload failed: ${error.message}`);
    }
  };

  // ✅ NEW: File upload helper function
  const uploadLectureFiles = async (lecture) => {
    const uploadedFiles = {
      video: null,
      thumbnail: null,
      notes: null,
      assignment: null
    };

    try {
      // ✅ Upload video (required)
      if (lecture.videoFile) {
        console.log('📹 Uploading video...');
        const videoData = await uploadFileToServer(lecture.videoFile, 'video', lecture.id);
        uploadedFiles.video = {
          url: videoData.url,
          publicId: videoData.publicId
        };
      } else if (lecture.video) {
        // Use existing video data
        uploadedFiles.video = lecture.video;
      }

      // ✅ Upload thumbnail (optional)
      if (lecture.thumbnailFile) {
        console.log('🖼️ Uploading thumbnail...');
        const thumbnailData = await uploadFileToServer(lecture.thumbnailFile, 'image', lecture.id);
        uploadedFiles.thumbnail = {
          url: thumbnailData.url,
          publicId: thumbnailData.publicId
        };
      } else if (lecture.thumbnail) {
        // Use existing thumbnail data
        uploadedFiles.thumbnail = lecture.thumbnail;
      }

      // ✅ Upload notes (optional)
      if (lecture.notesFile) {
        console.log('📄 Uploading notes...');
        const notesData = await uploadFileToServer(lecture.notesFile, 'pdf', lecture.id);
        uploadedFiles.notes = {
          fileUrl: notesData.url,
          fileName: lecture.notes?.fileName || lecture.notesFile.name,
          public_id: notesData.publicId
        };
      } else if (lecture.notes?.fileUrl) {
        // Use existing notes data
        uploadedFiles.notes = lecture.notes;
      }

      // ✅ Upload assignment (optional)
      if (lecture.assignmentFile) {
        console.log('📝 Uploading assignment...');
        const assignmentData = await uploadFileToServer(lecture.assignmentFile, 'pdf', lecture.id);
        uploadedFiles.assignment = {
          title: lecture.assignment?.title || '',
          description: lecture.assignment?.description || '',
          dueDate: lecture.assignment?.dueDate || null,
          fileUrl: assignmentData.url,
          public_id: assignmentData.publicId
        };
      } else if (lecture.assignment?.fileUrl) {
        // Use existing assignment data
        uploadedFiles.assignment = lecture.assignment;
      }

      console.log('✅ All files uploaded successfully:', uploadedFiles);
      return uploadedFiles;

    } catch (error) {
      console.error('❌ File upload error:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  };

  // ✅ NEW: Create lecture record in database
  const createLectureRecord = async (lecture, uploadedFiles) => {
    const payload = {
      title: lecture.title.trim(),
      courseId: courseId,
      chapterId: null, // Set based on structure - can be enhanced later
      video: uploadedFiles.video,
      thumbnail: uploadedFiles.thumbnail,
      notes: uploadedFiles.notes,
      assignment: uploadedFiles.assignment,
      quiz: lecture.quiz || null,
      codeLink: lecture.codeLink || lecture.codeUrl || null
    };

    try {
      const response = await axios.post('/api/instructor/lectures', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.lecture) {
        throw new Error('Invalid server response');
      }

      return response.data.lecture;

    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(`Database save failed: ${error.message}`);
    }
  };

  // ✅ NEW: Update frontend state after successful upload
  const updateLectureState = (tempLectureId, serverLectureData) => {
    if (hasDirectLectures) {
      // Update direct lectures
      setLectures(prev => prev.map(lec => 
        lec.id === tempLectureId 
          ? {
              ...lec,
              id: serverLectureData._id, // ✅ Replace temp ID with server ID
              video: serverLectureData.video,
              thumbnail: serverLectureData.thumbnail,
              notes: serverLectureData.notes,
              assignment: serverLectureData.assignment,
              quiz: serverLectureData.quiz,
              codeLink: serverLectureData.codeLink,
              // ✅ Clear file objects after upload
              videoFile: null,
              thumbnailFile: null,
              notesFile: null,
              assignmentFile: null
            }
          : lec
      ));
    } else {
      // Update chapter lectures
      setChapters(prev => prev.map(ch => ({
        ...ch,
        lectures: ch.lectures.map(lec =>
          lec.id === tempLectureId
            ? {
                ...lec,
                id: serverLectureData._id, // ✅ Replace temp ID with server ID
                video: serverLectureData.video,
                thumbnail: serverLectureData.thumbnail,
                notes: serverLectureData.notes,
                assignment: serverLectureData.assignment,
                quiz: serverLectureData.quiz,
                codeLink: serverLectureData.codeLink,
                // ✅ Clear file objects after upload
                videoFile: null,
                thumbnailFile: null,
                notesFile: null,
                assignmentFile: null
              }
            : lec
        )
      })));
    }
    
    console.log('✅ Frontend state updated with server data');
  };

  // ✅ ENHANCED: Complete lecture upload handler
  const handleUploadLecture = async (lecture) => {
    if (!courseId) {
      toast.error("Course ID is required for upload");
      return;
    }

    if (!lecture.title.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    // ✅ FIXED: Only video required (title already checked)
    if (!lecture.video && !lecture.videoFile) {
      toast.error("Please add a video to upload the lecture");
      return;
    }

    // Initialize upload progress
    setUploadProgress(prev => ({
      ...prev,
      [lecture.id]: { video: 0, image: 0, pdf: 0 }
    }));

    try {
      console.log('🚀 Starting lecture upload:', lecture);
      toast.loading(`Uploading lecture "${lecture.title}"...`, { id: 'upload-toast' });
      
      // ✅ Step 1: Upload files to BunnyCDN
      const uploadedFiles = await uploadLectureFiles(lecture);
      
      // ✅ Step 2: Create lecture record in database
      const lectureData = await createLectureRecord(lecture, uploadedFiles);
      
      // ✅ Step 3: Update frontend state with server data
      updateLectureState(lecture.id, lectureData);
      
      // Clear progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[lecture.id];
        return newProgress;
      });
      
      toast.success(`Lecture "${lecture.title}" uploaded successfully!`, { id: 'upload-toast' });
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error(`Upload failed: ${error.message}`, { id: 'upload-toast' });
      
      // Clear progress on error
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[lecture.id];
        return newProgress;
      });
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* ✅ Course Status Indicator */}
      {!courseId && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-300">
            💡 Save course as draft first to enable lecture uploads
          </span>
        </div>
      )}

      {/* ✅ Upload Progress Indicator */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-300 font-medium">Upload in progress...</span>
          </div>
          {Object.entries(uploadProgress).map(([lectureId, progress]) => (
            <div key={lectureId} className="text-xs text-blue-200">
              {Object.entries(progress).map(([fileType, percent]) => (
                percent > 0 && (
                  <div key={fileType} className="flex items-center gap-2 mb-1">
                    <span className="min-w-[50px]">{fileType}:</span>
                    <div className="flex-1 bg-blue-900 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span>{percent}%</span>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      )}

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

        {/* ✅ Structure Info */}
        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current Structure:</span>
            <span className="text-[#f35e33] font-medium">
              {hasDirectLectures 
                ? `${lectures.length} Direct Lecture${lectures.length !== 1 ? 's' : ''}`
                : `${chapters.length} Chapter${chapters.length !== 1 ? 's' : ''}`
              }
            </span>
          </div>
        </div>
      </section>

      {/* Builder Section */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6">
        {hasDirectLectures ? (
          <DirectLectureEditor
            courseId={courseId} // ✅ Pass courseId
            lectures={lectures}
            setLectures={setLectures}
            onOpenExtras={handleOpenExtras}
            onUploadLecture={handleUploadLecture} // ✅ Pass upload handler
          />
        ) : (
          <ChapterBuilder
            courseId={courseId} // ✅ Pass courseId
            chapters={chapters}
            setChapters={setChapters}
            onOpenExtras={handleOpenExtras}
            onUploadLecture={handleUploadLecture} // ✅ Pass upload handler
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
        onSave={handleLectureExtrasSave}
      />
    </div>
  );
};

export default CurriculumTab;
