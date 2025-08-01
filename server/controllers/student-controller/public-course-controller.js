const Course = require("../../models/CourseModel");

const getAllPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "published" });
    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch courses" });
  }
};

module.exports = { getAllPublishedCourses };
