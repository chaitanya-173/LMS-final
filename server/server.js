require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const lectureRoutes = require("./routes/instructor-routes/lecture-routes");
const chapterRoutes = require("./routes/instructor-routes/chapter-routes");
const courseRoutes = require("./routes/instructor-routes/courseB-routes");
const studentEnrollRoutes = require("./routes/student-routes/enrollment-routes");
const quizRoutes = require("./routes/student-routes/quiz-routes");
const assignmentRoutes = require("./routes/student-routes/assignment-routes");
const myCoursesRoutes = require("./routes/student-routes/my-course-routes");
const studentCourseDetailsRoutes = require("./routes/student-routes/course-details-routes");
const allCoursesRoutes = require("./routes/student-routes/all-course-routes");
const progressRoutes = require("./routes/student-routes/progress-routes"); 

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log(e));  

// middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/api/instructor/lectures", lectureRoutes);
app.use("/api/instructor/chapters", chapterRoutes);
app.use("/api/instructor/courses", courseRoutes);
app.use("/api/student", allCoursesRoutes); 
app.use("/api/student", studentEnrollRoutes);
app.use("/api/student", quizRoutes);
app.use("/api/student", assignmentRoutes);
app.use("/api/student", myCoursesRoutes);
app.use("/api/student", studentCourseDetailsRoutes);
app.use("/api/student/progress", progressRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

// server listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
