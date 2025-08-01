const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,
  instructorBio: String, // NEW: Optional instructor bio

  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String },
  tags: [String], // NEW: Hashtags for discoverability
  thumbnailUrl: { type: String },

  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },

  pricing: Number, // Current discounted price
  originalPrice: Number, // MRP
  discount: String, // e.g. "25%" (calculated or given manually)

  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },

  language: {
    type: String,
    enum: ['English', 'Hindi', 'Bilingual'],
  },

  validity: {
    type: String,
    enum: ['1 Month', '6 Months', '1 Year', '2 Years', 'Lifetime'],
  },

  includes: {
    type: [String],
    enum: [
      "Assignments",
      "Quizzes",
      "Notes",
      "Code Files",
      "Certificate of Completion"
    ],
    default: [],
  },

  rating: {
    type: Number,
    default: null,
  },
  ratingCount: {
    type: Number,
    default: null,
  },

  curriculum: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
  ],

  hasDirectLectures: { type: Boolean, default: false },

  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CourseB", CourseSchema);
