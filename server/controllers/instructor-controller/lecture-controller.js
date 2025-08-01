// *NEW*
const Lecture = require("../../models/LectureModel");
const { uploadMediaToBunny, deleteMediaFromBunny } = require("../../helpers/bunny"); 

const createLecture = async (req, res) => {
  try {
    const instructorId = req.user?.userId;
    if (!instructorId) {
      return res.status(403).json({ message: "Instructor not authenticated" });
    }

    const {
      title,
      courseId,
      chapterId,
      video,     // { url, publicId }
      thumbnail, // { url, publicId }
      codeLink,  // string (optional)
      notes,     // object/subschema { fileUrl, fileName, public_id }
      assignment,// object/subschema { title, description, fileUrl, public_id, dueDate }
      quiz,      // object/subschema { timeLimit, questions: [...] }
    } = req.body;

    // Video & thumbnail object validation
    if (
      !video || !video.url || !video.publicId ||
      !thumbnail || !thumbnail.url || !thumbnail.publicId
    ) {
      return res.status(400).json({
        message: "Video and thumbnail with url and publicId are required",
      });
    }

    const newLecture = new Lecture({
      title,
      instructorId,
      courseId,
      chapterId: chapterId || null,
      video,
      thumbnail,
      codeLink,
      notes,
      assignment,
      quiz,
    });

    await newLecture.save();

    res.status(201).json({
      message: "Lecture created successfully",
      lecture: newLecture,
    });

  } catch (err) {
    console.error("Error creating lecture:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const existingLecture = await Lecture.findById(lectureId);
    if (!existingLecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const updateData = {};

    if (req.body.title) updateData.title = req.body.title;

    // Quiz update
    if (req.body.quiz) updateData.quiz = req.body.quiz;

    // Notes update
    if (req.body.notes) updateData.notes = req.body.notes;

    // Assignment update
    if (req.body.assignment) updateData.assignment = req.body.assignment;

    // codeLink update
    if (req.body.codeLink) updateData.codeLink = req.body.codeLink;

    // Video update (delete previous Bunny file if publicId different)
    if (req.body.video) {
      if (
        req.body.video.url &&
        req.body.video.publicId &&
        req.body.video.publicId !== existingLecture.video.publicId
      ) {
        try {
          await deleteMediaFromBunny(existingLecture.video.publicId);
        } catch (err) {
          console.error("Failed to delete old video from Bunny CDN:", err);
        }
        updateData.video = req.body.video;
      } else if (req.body.video.url && req.body.video.publicId) {
        updateData.video = req.body.video;
      }
    }

    // Thumbnail update
    if (req.body.thumbnail) {
      if (
        req.body.thumbnail.url &&
        req.body.thumbnail.publicId &&
        req.body.thumbnail.publicId !== existingLecture.thumbnail.publicId
      ) {
        try {
          await deleteMediaFromBunny(existingLecture.thumbnail.publicId);
        } catch (err) {
          console.error("Failed to delete old thumbnail from Bunny CDN:", err);
        }
        updateData.thumbnail = req.body.thumbnail;
      } else if (req.body.thumbnail.url && req.body.thumbnail.publicId) {
        updateData.thumbnail = req.body.thumbnail;
      }
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Lecture updated",
      lecture: updatedLecture,
    });
  } catch (err) {
    console.error("Error updating lecture:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Bunny CDN deletion: video, thumbnail
    if (lecture.video && lecture.video.publicId) {
      try {
        await deleteMediaFromBunny(lecture.video.publicId);
      } catch (err) {
        console.error("Failed to delete video from Bunny CDN:", err);
      }
    }
    if (lecture.thumbnail && lecture.thumbnail.publicId) {
      try {
        await deleteMediaFromBunny(lecture.thumbnail.publicId);
      } catch (err) {
        console.error("Failed to delete thumbnail from Bunny CDN:", err);
      }
    }
    // Notes/Assignment file deletion if needed
    if (lecture.notes && lecture.notes.public_id) {
      try {
        await deleteMediaFromBunny(lecture.notes.public_id);
      } catch (err) {
        console.error("Failed to delete notes file from Bunny CDN:", err);
      }
    }
    if (lecture.assignment && lecture.assignment.public_id) {
      try {
        await deleteMediaFromBunny(lecture.assignment.public_id);
      } catch (err) {
        console.error("Failed to delete assignment file from Bunny CDN:", err);
      }
    }

    await Lecture.findByIdAndDelete(lectureId);

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (err) {
    console.error("Error deleting lecture:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getLecturesByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const lectures = await Lecture.find({ chapterId });

    res.status(200).json({ lectures });
  } catch (err) {
    console.error("Error fetching lectures by chapter:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await Lecture.find({
      courseId,
      chapterId: null, // direct lectures only
    });

    res.status(200).json({ lectures });
  } catch (err) {
    console.error("Error fetching direct course lectures:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllLecturesForInstructor = async (req, res) => {
  try {
    const instructorId = req.user?.userId;
    const lectures = await Lecture.find({ instructorId })
      .sort({ createdAt: -1 })
      .select("title videoUrl thumbnailUrl notes quiz assignment codeLink createdAt");

    res.json({ success: true, lectures });
  } catch (error) {
    console.error("getAllLecturesForInstructor error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lectures." });
  }
};

const getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    res.status(200).json({ lecture });
  } catch (err) {
    console.error("Error fetching lecture:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLecture,
  getLecturesByChapter,
  getLecturesByCourse,
  getAllLecturesForInstructor,
  getLectureById,
  updateLecture,
  deleteLecture,
};
