const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String },
  },
  { _id: false }
);

const AssignmentSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    files: {
      type: [FileSchema],
      validate: [
        (arr) => Array.isArray(arr) && arr.length > 0,
        "At least one file required.",
      ],
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    remarks: {
      type: String,
    },

    grade: { type: String }, // like "A", "B+" or "Pass"
    score: { type: Number }, // numeric score if needed

    status: {
      type: String,
      enum: ["submitted", "late", "graded", "resubmitted"],
      default: "submitted",
    },

    isLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one submission per student per lecture (resubmission overwrites old)
AssignmentSubmissionSchema.index({ studentId: 1, lectureId: 1 }, { unique: true });

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
