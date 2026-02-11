import axiosClient from "./axiosClient";
import type { LessonProgressDto, CourseProgressDto } from "../types";

export const progressApi = {
  completeLesson: (lessonId: string) =>
    axiosClient.post<LessonProgressDto>(`/lessons/${lessonId}/complete`),

  getCourseProgress: (courseId: string) =>
    axiosClient.get<CourseProgressDto>(`/courses/${courseId}/progress`),

  uncompleteLesson: (lessonId: string) =>
    axiosClient.post<LessonProgressDto>(`/lessons/${lessonId}/uncomplete`),

  updateWatchProgress: (lessonId: string, watchPercent: number) =>
    axiosClient.put<LessonProgressDto>(`/lessons/${lessonId}/watch-progress`, { watchPercent }),
};
