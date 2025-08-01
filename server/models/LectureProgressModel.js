const mongoose = require("mongoose");

const lectureProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },

  watchTime: { type: Number, default: 0 }, // in seconds
  duration: { type: Number, default: 0 }, // full duration of lecture video
  completed: { type: Boolean, default: false },

  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LectureProgress", lectureProgressSchema);
