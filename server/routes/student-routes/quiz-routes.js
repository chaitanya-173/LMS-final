const express = require("express");
const router = express.Router();
const {
  submitQuiz,
  getQuizStatus,
  getQuizResult
} = require("../../controllers/student-controller/quiz-response-controller");
const authenticate = require("../../middlewares/auth-middleware");

// ✅ Submit quiz attempt
router.post("/quiz/:lectureId", authenticate, submitQuiz);

// ✅ Check quiz status (attempted or not)
router.get("/quiz/:lectureId/status", authenticate, getQuizStatus);

// routes/studentRoutes.js
router.get("/quiz/:lectureId/result", authenticate, getQuizResult);


module.exports = router;
