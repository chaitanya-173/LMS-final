// *NEW*
const express = require("express");
const router = express.Router();

const {
  createCourse,
  getCoursesByInstructor,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublishStatus
} = require("../../controllers/instructor-controller/courseB-controller");

router.post("/", createCourse);  // create course
router.get("/instructor/:instructorId", getCoursesByInstructor);  // get all courses by instructor
router.get("/:id", getCourseById);  // get single course by ID
router.patch("/:id", updateCourse);  // update course
router.delete("/:id", deleteCourse);  // delete course
router.patch("/:id/status", togglePublishStatus);  // toggle publish status

module.exports = router;
