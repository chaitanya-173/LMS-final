// controllers/student/assignmentController.js

const mongoose = require("mongoose");
const AssignmentSubmission = require("../../models/AssignmentSubmissionModel");
const Lecture = require("../../models/LectureModel");
const Course = require("../../models/CourseModel");

/**
 * Utility: normalize array of files from req.body / req.files
 * Accepts body.files = [{fileUrl, fileName}, ...] OR single top-level {fileUrl, fileName}
 */
function extractFiles(req) {
  // If using multer/cloudinary integration later, adapt here.
  const { files, fileUrl, fileName } = req.body || {};

  if (Array.isArray(files) && files.length) {
    return files
      .filter((f) => f?.fileUrl)
      .map((f) => ({ fileUrl: f.fileUrl, fileName: f.fileName || null }));
  }

  if (fileUrl) {
    return [{ fileUrl, fileName: fileName || null }];
  }

  // If multipart uploads: req.files?
  // Example shape: [{ path: '...', originalname: '...' }]
  if (Array.isArray(req.files) && req.files.length) {
    return req.files.map((f) => ({
      fileUrl: f.path || f.location, // depends on storage
      fileName: f.originalname,
    }));
  }

  return [];
}

/**
 * Utility: fetch lecture & course; throw errors if invalid.
 * Returns { lecture, course, assignmentMeta }
 */
async function loadLectureAndCourse(lectureId) {
  const lecture = await Lecture.findById(lectureId).lean();
  if (!lecture) {
    const err = new Error("Lecture not found.");
    err.status = 404;
    throw err;
  }

  const course = await Course.findById(lecture.courseId || lecture.course || undefined).lean();
  if (!course) {
    const err = new Error("Course not found for this lecture.");
    err.status = 404;
    throw err;
  }

  // assignment meta lives on lecture.assignment
  const assignmentMeta = lecture.assignment || {};

  return { lecture, course, assignmentMeta };
}

/**
 * Utility: determine if submission is allowed & late.
 * Input: assignmentMeta { dueDate, allowResubmission }, hasExisting, now
 */
function evaluateSubmissionWindow(assignmentMeta, existingSubmission) {
  const now = Date.now();
  const dueMs = assignmentMeta?.dueDate ? new Date(assignmentMeta.dueDate).getTime() : null;
  const allowResub = assignmentMeta?.allowResubmission ?? true;

  const pastDue = dueMs ? now > dueMs : false;

  // Allowed?
  let allowed = true;
  let reason = null;

  if (pastDue) {
    // after due date
    if (!existingSubmission) {
      // first submit after due = allow but mark late? depends on policy
      // We'll allow but mark late. If you want to block, change here.
      allowed = true;
      reason = "Late submission (accepted).";
    } else {
      // resub after due? Not allowed.
      allowed = false;
      reason = "Past due date. Resubmission not allowed.";
    }
  } else {
    // before due date
    if (existingSubmission && !allowResub) {
      allowed = false;
      reason = "Resubmission disabled.";
    }
  }

  return {
    allowed,
    pastDue,
    reason,
  };
}

/**
 * POST /api/student/assignments/submit
 * Body: { lectureId, courseId?, files: [{fileUrl,fileName}], remarks? }
 * Reads studentId from req.user.userId
 */
exports.submitAssignment = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { lectureId, courseId: bodyCourseId, remarks } = req.body || {};

    if (!lectureId) {
      return res.status(400).json({ message: "lectureId required." });
    }

    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ message: "Invalid lectureId." });
    }

    const files = extractFiles(req);
    if (!files.length) {
      return res.status(400).json({ message: "At least one file required." });
    }

    // lecture + course
    const { lecture, course, assignmentMeta } = await loadLectureAndCourse(lectureId);

    // optional courseId check
    if (bodyCourseId && bodyCourseId !== String(course._id)) {
      return res.status(400).json({ message: "courseId mismatch with lecture." });
    }

    // existing?
    const existing = await AssignmentSubmission.findOne({ studentId, lectureId });

    // rules
    const { allowed, pastDue, reason } = evaluateSubmissionWindow(assignmentMeta, existing);
    if (!allowed) {
      return res.status(400).json({ message: reason || "Submission blocked." });
    }

    const status = pastDue ? "late" : existing ? "resubmitted" : "submitted";

    // upsert
    const doc = await AssignmentSubmission.findOneAndUpdate(
      { studentId, lectureId },
      {
        studentId,
        lectureId,
        courseId: course._id,
        files,
        remarks: remarks || existing?.remarks,
        submittedAt: new Date(),
        status,
        isLate: !!pastDue,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // enriched response
    return res.json({
      message: existing
        ? pastDue
          ? "Late resubmission saved."
          : "Resubmission saved."
        : pastDue
        ? "Late submission saved."
        : "Assignment submitted.",
      submission: doc,
      assignment: {
        title: assignmentMeta?.title || "Assignment",
        dueDate: assignmentMeta?.dueDate || null,
        allowResubmission: assignmentMeta?.allowResubmission ?? true,
        fileUrl: assignmentMeta?.fileUrl || null,
      },
      course: {
        _id: course._id,
        title: course.title,
      },
      lecture: {
        _id: lecture._id,
        title: lecture.title,
      },
    });
  } catch (err) {
    console.error("submitAssignment error:", err);
    const code = err.status || 500;
    return res.status(code).json({ message: err.message || "Server error." });
  }
};

/**
 * GET /api/student/assignments/:lectureId/status
 * Returns student submission info + assignment meta (dueDate etc.)
 */
exports.getAssignmentStatus = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { lectureId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      return res.status(400).json({ message: "Invalid lectureId." });
    }

    const { lecture, course, assignmentMeta } = await loadLectureAndCourse(
      lectureId
    );

    const submission = await AssignmentSubmission.findOne({
      studentId,
      lectureId,
    }).lean();

    const resp = {
      submitted: !!submission,
      submission,
      assignment: {
        title: assignmentMeta?.title || "Assignment",
        fileUrl: assignmentMeta?.fileUrl || null,
        dueDate: assignmentMeta?.dueDate || null,
        allowResubmission: assignmentMeta?.allowResubmission ?? true,
      },
      course: {
        _id: course._id,
        title: course.title,
      },
      lecture: {
        _id: lecture._id,
        title: lecture.title,
      },
    };

    return res.json(resp);
  } catch (err) {
    console.error("getAssignmentStatus error:", err);
    const code = err.status || 500;
    return res.status(code).json({ message: err.message || "Server error." });
  }
};

/**
 * DELETE /api/student/assignments/:submissionId
 * Removes a submission IF before due date AND not graded.
 */
exports.deleteAssignmentSubmission = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { submissionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid submissionId." });
    }

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    if (String(submission.studentId) !== String(studentId)) {
      return res.status(403).json({ message: "Not your submission." });
    }

    // Load lecture -> check dueDate
    const { assignmentMeta } = await loadLectureAndCourse(submission.lectureId);

    // If graded, block deletion
    if (submission.status === "graded" || submission.grade != null || submission.score != null) {
      return res
        .status(400)
        .json({ message: "Cannot delete graded submission." });
    }

    // If past due date, block deletion (optional policy)
    const dueMs = assignmentMeta?.dueDate
      ? new Date(assignmentMeta.dueDate).getTime()
      : null;
    if (dueMs && Date.now() > dueMs) {
      return res
        .status(400)
        .json({ message: "Cannot delete after due date." });
    }

    await submission.deleteOne();

    return res.json({ message: "Submission deleted." });
  } catch (err) {
    console.error("deleteAssignmentSubmission error:", err);
    const code = err.status || 500;
    return res.status(code).json({ message: err.message || "Server error." });
  }
};
