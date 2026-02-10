import axiosClient from "./axiosClient";
import type { LessonDto, CreateLessonRequest } from "../types";

export const lessonApi = {
  getByCourse: (courseId: string) =>
    axiosClient.get<LessonDto[]>(`/courses/${courseId}/lessons`),

  create: (courseId: string, data: CreateLessonRequest) =>
    axiosClient.post<LessonDto>(`/courses/${courseId}/lessons`, data),

  update: (id: string, data: CreateLessonRequest) =>
    axiosClient.put<LessonDto>(`/lessons/${id}`, data),

  delete: (id: string) =>
    axiosClient.delete(`/lessons/${id}`),
};
