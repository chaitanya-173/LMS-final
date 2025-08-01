// *NEW*
const express = require("express");
const router = express.Router();
const { enrollInCourse } = require("../../controllers/student-controller/enrollment-controller");
const authenticate = require("../../middlewares/auth-middleware");

router.post("/enroll/:courseId", authenticate, enrollInCourse);

module.exports = router;
