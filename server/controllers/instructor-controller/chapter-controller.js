// *NEW*
const Chapter = require("../../models/ChapterModel");

const createChapter = async (req, res) => {
  try {
    const { title, description, courseId, order } = req.body;

    const newChapter = new Chapter({ title, description, courseId, order });
    await newChapter.save();

    res.status(201).json({ message: "Chapter created", chapter: newChapter });
  } catch (err) {
    console.error("Error creating chapter:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getChaptersByCourse = async (req, res) => {
  try {
    const chapters = await Chapter.find({ courseId: req.params.courseId }).sort(
      { order: 1 }
    );
    res.status(200).json({ chapters });
  } catch (err) {
    console.error("Error fetching chapters:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateChapter = async (req, res) => {
  try {
    const updated = await Chapter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Chapter not found" });
    res.status(200).json({ message: "Chapter updated", chapter: updated });
  } catch (err) {
    console.error("Error updating chapter:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const deleted = await Chapter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Chapter not found" });

    res.status(200).json({ message: "Chapter deleted" });
  } catch (err) {
    console.error("Error deleting chapter:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.status(200).json({ chapter });
  } catch (err) {
    console.error("Error fetching chapter:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createChapter,
  getChaptersByCourse,
  updateChapter,
  deleteChapter,
  getChapterById,
};
