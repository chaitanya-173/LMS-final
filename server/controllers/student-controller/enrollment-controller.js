// *NEW*
const Course = require("../../models/CourseModel");

const enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const studentName = req.user.userName;
    const studentEmail = req.user.email;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const alreadyEnrolled = course.students.find(
      (s) => s.studentId === studentId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Student already enrolled" });
    }

    course.students.push({ studentId, studentName, studentEmail });
    await course.save();

    res.status(200).json({ message: "Enrolled successfully", course });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  enrollInCourse
};

