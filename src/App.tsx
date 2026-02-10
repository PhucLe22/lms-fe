import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import ToastContainer from "./components/ui/ToastContainer";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CourseListPage from "./pages/courses/CourseListPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import CourseFormPage from "./pages/courses/CourseFormPage";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import CourseProgressPage from "./pages/student/CourseProgressPage";
import AdminLessonsPage from "./pages/admin/AdminLessonsPage";
import LessonStudyPage from "./pages/courses/LessonStudyPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <main className="max-w-5xl mx-auto px-6 py-10">
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<CourseListPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonStudyPage />} />

                {/* Admin Routes */}
                <Route
                  path="/courses/new"
                  element={
                    <ProtectedRoute role="Admin">
                      <CourseFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:id/edit"
                  element={
                    <ProtectedRoute role="Admin">
                      <CourseFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/lessons/:courseId"
                  element={
                    <ProtectedRoute role="Admin">
                      <AdminLessonsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/my-courses"
                  element={
                    <ProtectedRoute role="Student">
                      <MyCoursesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-courses/:courseId/progress"
                  element={
                    <ProtectedRoute role="Student">
                      <CourseProgressPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
