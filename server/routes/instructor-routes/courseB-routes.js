// *NEW*
const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth-middleware");

const {
  createCourse,
  getCoursesByInstructor,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublishStatus
} = require("../../controllers/instructor-controller/courseB-controller");

router.post("/", authenticate, createCourse);  // create course
router.get("/instructor/:instructorId", authenticate, getCoursesByInstructor);  // get all courses by instructor
router.get("/:id", getCourseById);  // get single course by ID
router.patch("/:id", authenticate, updateCourse);  // update course
router.delete("/:id", authenticate, deleteCourse);  // delete course
router.patch("/:id/status", authenticate, togglePublishStatus);  // toggle publish status

module.exports = router;
