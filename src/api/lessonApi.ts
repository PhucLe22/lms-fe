import type { AxiosProgressEvent } from "axios";
import axiosClient from "./axiosClient";
import type { LessonDto, CreateLessonRequest } from "../types";

export const lessonApi = {
  getByCourse: (courseId: string) =>
    axiosClient.get<LessonDto[]>(`/courses/${courseId}/lessons`),

  create: (courseId: string, data: CreateLessonRequest, onUploadProgress?: (e: AxiosProgressEvent) => void) =>
    axiosClient.post<LessonDto>(`/courses/${courseId}/lessons`, data, { onUploadProgress }),

  update: (id: string, data: CreateLessonRequest, onUploadProgress?: (e: AxiosProgressEvent) => void) =>
    axiosClient.put<LessonDto>(`/lessons/${id}`, data, { onUploadProgress }),

  delete: (id: string) =>
    axiosClient.delete(`/lessons/${id}`),
};
