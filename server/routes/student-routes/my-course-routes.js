// *NEW*
const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth-middleware");
const { getMyCourses } = require("../../controllers/student-controller/my-course-controller");

router.get("/my-courses", authenticate, getMyCourses);

module.exports = router;
