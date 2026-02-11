// === Auth ===
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: "Admin" | "Student";
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Student";
  createdAt: string;
}

// === Course ===
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CourseDto {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  creatorName: string;
  createdAt: string;
  lessonCount: number;
  enrollmentCount: number;
}

export interface CourseDetailDto {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  creatorName: string;
  createdAt: string;
  lessons: LessonDto[];
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  level: CourseLevel;
}

export interface UpdateCourseRequest {
  title: string;
  description?: string;
  level: CourseLevel;
}

// === Lesson ===
export interface LessonDto {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  documentUrl: string | null;
  orderIndex: number;
  createdAt: string;
}

export interface CreateLessonRequest {
  title: string;
  content: string;
  orderIndex: number;
  videoUrl?: string;
  documentUrl?: string;
}

// === Enrollment ===
export interface EnrollmentDto {
  id: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: "Active" | "Completed";
}

// === Progress ===
export interface LessonProgressDto {
  lessonId: string;
  lessonTitle: string;
  orderIndex: number;
  isCompleted: boolean;
  completedAt: string | null;
  videoWatchPercent: number;
}

export interface CourseProgressDto {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lessons: LessonProgressDto[];
}

// === Admin / Student ===
export interface StudentListDto {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Student";
  createdAt: string;
  enrolledCourses: number;
}

export interface StudentDetailDto {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Student";
  createdAt: string;
  enrollments: StudentEnrollmentDto[];
}

export interface StudentEnrollmentDto {
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: "Active" | "Completed";
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

// === Quiz ===
export type QuizAnswer = "A" | "B" | "C" | "D";

export interface QuizDto {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: QuizAnswer;
  orderIndex: number;
}

export interface CreateQuizRequest {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: QuizAnswer;
}

export interface QuizSubmitRequest {
  answers: { quizId: string; answer: QuizAnswer }[];
}

export interface QuizResultDto {
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: string;
  details: QuizResultDetailDto[];
}

export interface QuizResultDetailDto {
  quizId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedAnswer: QuizAnswer;
  correctAnswer: QuizAnswer;
  isCorrect: boolean;
}

// === Practice ===
export interface PracticeTaskDto {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  submissionType: "Text" | "GitUrl";
}

export interface CreatePracticeTaskRequest {
  title: string;
  description: string;
  submissionType: "Text" | "GitUrl";
}

export interface PracticeSubmissionDto {
  id: string;
  practiceTaskId: string;
  studentName: string;
  content: string;
  submittedAt: string;
}

export interface SubmitPracticeRequest {
  content: string;
}

// === Dashboard ===
export interface DashboardDto {
  totalEnrolledCourses: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  overallProgressPercent: number;
  averageQuizScore: number;
  totalQuizzesTaken: number;
  courses: DashboardCourseDto[];
}

export interface DashboardCourseDto {
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
}

// === Pagination ===
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
