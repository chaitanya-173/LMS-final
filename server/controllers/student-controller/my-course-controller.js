const Course = require("../../models/CourseModel");

const getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const courses = await Course.find({
      "students.studentId": studentId,
    });

    res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      courses,
    });
  } catch (err) {
    console.error("Get My Courses Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

module.exports = { getMyCourses };
