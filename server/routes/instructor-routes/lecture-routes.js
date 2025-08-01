// *NEW*
const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth-middleware");

const {
  createLecture,
  getLecturesByChapter,
  getLecturesByCourse,
  updateLecture,
  deleteLecture,
  getLectureById,
  getAllLecturesForInstructor,
} = require("../../controllers/instructor-controller/lecture-controller");

router.post("/", authenticate, createLecture); // create a new lecture
router.get("/by-chapter/:chapterId", getLecturesByChapter); // get lectures by chapterId (for dropdown)
router.get("/by-course/:courseId", getLecturesByCourse); // get lectures by courseId (for course-level lectures)

router.get("/library", authenticate, getAllLecturesForInstructor); // get all lectures of the instructor

router.get("/:id", authenticate, getLectureById); // get lecture
router.patch("/:id", authenticate, updateLecture); // update lecture
router.delete("/:id", authenticate, deleteLecture); // delete lecture

module.exports = router;
