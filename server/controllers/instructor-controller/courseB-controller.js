// *NEW*
const Course = require("../../models/CourseModel"); // Use correct path as per your file structure

const createCourse = async (req, res) => {
  try {
    // Get instructorId from authenticated user instead of body
    const instructorId = req.user?.userId || req.user?._id;
    
    const {
      title,
      slug,              // ✅ Add missing
      shortDescription,  // ✅ Add missing  
      description,
      category,
      tags,
      thumbnail,         // ✅ Object instead of thumbnailUrl
      pricing,
      originalPrice,
      discount,
      level,
      language,
      validity,
      includes,
      status,
      hasDirectLectures,
    } = req.body;

    const newCourse = new Course({
      instructorId,
      instructorName: req.user?.userName,     // ✅ From auth user
      instructorBio: req.user?.bio,          // ✅ From auth user
      title,
      slug,              // ✅ Add
      shortDescription,  // ✅ Add
      description,
      category,
      tags,
      thumbnail,         // ✅ Object instead of thumbnailUrl
      pricing,
      originalPrice,
      discount,
      level,
      language,
      validity,
      includes,
      status: status || "draft",  // ✅ Default to draft
      hasDirectLectures,
    });

    await newCourse.save();
    res.status(201).json({ 
      success: true,
      message: "Course created successfully", 
      course: newCourse 
    });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to create course",
      error: err.message 
    });
  }
};

const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await Course.find({ instructorId }).sort({ createdAt: -1 });
    res.status(200).json({ courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("curriculum");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ course });
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCourse = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course updated", course: updated });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ message: "Course deleted" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const togglePublishStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.status = course.status === "published" ? "draft" : "published";
    await course.save();

    res.status(200).json({ message: `Course is now ${course.status}`, course });
  } catch (err) {
    console.error("Error toggling status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCourse,
  getCoursesByInstructor,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublishStatus,
};
