const mongoose = require("mongoose");

// ------------------ Notes Subschema ------------------
const NoteSchema = new mongoose.Schema(
  {
    fileUrl: String,
    fileName: String,
    public_id: String,
  },
  { timestamps: true }
);

// ------------------ Assignment Subschema ------------------
const AssignmentSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    fileUrl: String,
    public_id: String,
    dueDate: Date,
  },
  { timestamps: true }
);

// ------------------ Quiz Subschema ------------------
const QuizSchema = new mongoose.Schema(
  {
    timeLimit: { type: Number, default: 0 },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// ------------------ Lecture Schema ------------------
const LectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: null,
    },

    video: {
      url: { type: String, required: true },
      publicId: { type: String, required: true }, // For video on Bunny
    },

    thumbnail: {
      url: { type: String },
      publicId: { type: String }, // For thumbnail on Bunny
    },
    
    codeLink: String,
    notes: NoteSchema,
    quiz: QuizSchema,
    assignment: AssignmentSchema,
  },
  { timestamps: true } // Adds createdAt and updatedAt to the Lecture itself
);

module.exports = mongoose.model("Lecture", LectureSchema);
