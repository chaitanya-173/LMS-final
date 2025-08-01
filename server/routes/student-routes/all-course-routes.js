const express = require("express");
const router = express.Router();

const { getAllPublishedCourses } = require("../../controllers/student-controller/public-course-controller");

router.get("/courses", getAllPublishedCourses); 

module.exports = router;
