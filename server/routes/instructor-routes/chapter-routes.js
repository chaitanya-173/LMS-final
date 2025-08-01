// *NEW*
const express = require("express");
const router = express.Router();

const {
  createChapter,
  getChaptersByCourse,
  updateChapter,
  deleteChapter,
  getChapterById,
} = require("../../controllers/instructor-controller/chapter-controller");

router.post("/", createChapter); // create chapter
router.get("/course/:courseId", getChaptersByCourse); // get all chapters by course
router.patch("/:id", updateChapter); // update chapter
router.delete("/:id", deleteChapter); // delete chapter
router.get("/:id", getChapterById); // get chapter by id

module.exports = router;
