const Course = require("../../models/CourseModel");
const Chapter = require("../../models/ChapterModel");
const Lecture = require("../../models/LectureModel");

const getCourseDetailsForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Find the course
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Get all chapters for the course
    const chapters = await Chapter.find({ courseId }).lean();

    // 3. Get all lectures inside those chapters
    const chapterIds = chapters.map(ch => ch._id);
    const lectures = await Lecture.find({
      courseId: courseId,
      chapterId: { $in: [null, undefined] }
    });

    // 4. Attach lectures to each chapter
    const chaptersWithLectures = chapters.map(ch => {
      const chapterLectures = lectures.filter(lec => lec.chapterId.toString() === ch._id.toString());
      return { ...ch, lectures: chapterLectures };
    });

    res.status(200).json({
      success: true,
      message: "Course details fetched",
      course,
      lectures,
      curriculum: chaptersWithLectures,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getCourseDetailsForStudent };
