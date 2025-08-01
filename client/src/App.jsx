import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import PrivateRoute from "@/components/routes/PrivateRoute";
import AuthRedirect from "@/components/routes/AuthRedirect";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import PageNotFound from "./pages/misc/PageNotFound";
import LandingPage from "./pages/Landingpage";
import Home from "./pages/Home";
import Courses from "./pages/AllCourses";
import MyCourses from "./pages/MyCourses";
import CourseDetailsPage from "./pages/CourseDetails";
import BuyPage from "./pages/BuyPage";
import MyCoursePlayer from "@/pages/MyCoursePlayer";
import CourseOverview from "./pages/CourseOverview";
import PdfViewer from "@/pages/PdfViewer";
import QuizAttempt from "@/pages/QuizAttempt";
import QuizResult from "@/pages/QuizResult";
import InstructorLayout from "./layouts/InstructorLayout";
import InstructorDashboard from "./pages/instructor/InstructorDashboard.jsx";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import CreateCourse from "./pages/instructor/create-course/CreateCourse";
import StudentActivity from "./pages/instructor/StudentActivity";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/all-courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="/buy/:courseId" element={<BuyPage />} />

        {/* Protected Routes */}
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-overview/:courseId"
          element={
            <PrivateRoute>
              <CourseOverview />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-courses/:courseId/player"
          element={
            <PrivateRoute>
              <MyCoursePlayer />
            </PrivateRoute>
          }
        />
        <Route
          path="/pdf-viewer/:lectureId/:docType"
          element={
            <PrivateRoute>
              <PdfViewer />
            </PrivateRoute>
          }
        />
        <Route
          path="/quiz/:lectureId"
          element={
            <PrivateRoute>
              <QuizAttempt />
            </PrivateRoute>
          }
        />
        <Route
          path="/quiz/:lectureId/result"
          element={
            <PrivateRoute>
              <QuizResult />
            </PrivateRoute>
          }
        />
        <Route
          path="/quiz/:lectureId/result"
          element={
            <PrivateRoute>
              <QuizResult />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="students" element={<StudentActivity />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
          duration: 3000,
        }}
      />
    </Router>
  );
}

export default App;
