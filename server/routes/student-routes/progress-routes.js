const express = require("express");
const router = express.Router();
const LectureProgress = require("../../models/LectureProgressModel");
const authenticate = require("../../middlewares/auth-middleware");

// Save or update progress
router.post("/save", authenticate, async (req, res) => {
  try {
    const { courseId, lectureId, watchTime, duration } = req.body;
    const userId = req.user._id;

    const completed = watchTime >= duration * 0.95;

    const existing = await LectureProgress.findOne({ userId, lectureId });

    if (existing) {
      existing.watchTime = watchTime;
      existing.duration = duration;
      existing.completed = completed;
      existing.lastUpdated = Date.now();
      await existing.save();
    } else {
      await LectureProgress.create({
        userId,
        courseId,
        lectureId,
        watchTime,
        duration,
        completed,
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Progress Save Error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// Fetch progress for a user in a course
router.get("/course/:courseId", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const progress = await LectureProgress.find({ userId, courseId });
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;
