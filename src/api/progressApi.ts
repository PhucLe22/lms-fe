import axiosClient from "./axiosClient";
import type { LessonProgressDto, CourseProgressDto } from "../types";

export const progressApi = {
  completeLesson: (lessonId: string) =>
    axiosClient.post<LessonProgressDto>(`/lessons/${lessonId}/complete`),

  getCourseProgress: (courseId: string) =>
    axiosClient.get<CourseProgressDto>(`/courses/${courseId}/progress`),
};
