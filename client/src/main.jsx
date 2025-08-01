import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { InstructorProvider } from "./context/InstructorContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CourseProvider>
        <InstructorProvider>
          <App />
        </InstructorProvider>
      </CourseProvider>
    </AuthProvider>
  </React.StrictMode>
);
