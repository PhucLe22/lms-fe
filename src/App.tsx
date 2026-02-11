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
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import CourseListPage from "./pages/courses/CourseListPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import CourseFormPage from "./pages/courses/CourseFormPage";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import CourseProgressPage from "./pages/student/CourseProgressPage";
import AdminLessonsPage from "./pages/admin/AdminLessonsPage";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import AdminStudentDetailPage from "./pages/admin/AdminStudentDetailPage";
import LessonStudyPage from "./pages/courses/LessonStudyPage";
import DashboardPage from "./pages/student/DashboardPage";
import QuizPage from "./pages/quiz/QuizPage";
import AdminQuizPage from "./pages/quiz/AdminQuizPage";
import PracticePage from "./pages/practice/PracticePage";
import AdminPracticePage from "./pages/practice/AdminPracticePage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";

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
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/courses" element={<CourseListPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonStudyPage />} />
                <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                <Route path="/courses/:courseId/lessons/:lessonId/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />

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
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute role="Admin">
                      <AdminStudentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students/:id"
                  element={
                    <ProtectedRoute role="Admin">
                      <AdminStudentDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/lessons/:courseId/:lessonId/quiz"
                  element={
                    <ProtectedRoute role="Admin">
                      <AdminQuizPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/lessons/:courseId/:lessonId/practice"
                  element={
                    <ProtectedRoute role="Admin">
                      <AdminPracticePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/system"
                  element={
                    <ProtectedRoute role="Admin">
                      <AdminSystemPage />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute role="Student">
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
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
