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
export interface CourseDto {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  createdAt: string;
  lessonCount: number;
  enrollmentCount: number;
}

export interface CourseDetailDto {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  createdAt: string;
  lessons: LessonDto[];
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
}

export interface UpdateCourseRequest {
  title: string;
  description?: string;
}

// === Lesson ===
export interface LessonDto {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  createdAt: string;
}

export interface CreateLessonRequest {
  title: string;
  content: string;
  orderIndex: number;
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

// === Pagination ===
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
