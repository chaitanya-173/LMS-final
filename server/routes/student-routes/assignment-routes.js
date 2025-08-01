const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth-middleware"); 
const {
  submitAssignment,
  getAssignmentStatus,
  deleteAssignmentSubmission,
} = require("../../controllers/student-controller/assignment-controller");

// Routes
router.post("/assignments/submit", authenticate, submitAssignment);
router.get("/assignments/:lectureId/status", authenticate, getAssignmentStatus);
router.delete("/assignments/:submissionId", authenticate, deleteAssignmentSubmission);

module.exports = router;
