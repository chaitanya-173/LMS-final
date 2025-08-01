const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth-middleware");
const { getCourseDetailsForStudent } = require("../../controllers/student-controller/course-details-controller");

router.get("/course/:courseId", authenticate, getCourseDetailsForStudent);

module.exports = router;
