import axiosClient from "./axiosClient";
import type {
  PracticeTaskDto,
  CreatePracticeTaskRequest,
  PracticeSubmissionDto,
  SubmitPracticeRequest,
} from "../types";

export const practiceApi = {
  getByLesson: (lessonId: string) =>
    axiosClient.get<PracticeTaskDto[]>(`/lessons/${lessonId}/practice`),

  create: (lessonId: string, data: CreatePracticeTaskRequest) =>
    axiosClient.post<PracticeTaskDto>(`/lessons/${lessonId}/practice`, data),

  update: (id: string, data: CreatePracticeTaskRequest) =>
    axiosClient.put<PracticeTaskDto>(`/practice/${id}`, data),

  delete: (id: string) =>
    axiosClient.delete(`/practice/${id}`),

  submit: (id: string, data: SubmitPracticeRequest) =>
    axiosClient.post<PracticeSubmissionDto>(`/practice/${id}/submit`, data),

  getMySubmissions: (id: string) =>
    axiosClient.get<PracticeSubmissionDto[]>(`/practice/${id}/my-submissions`),

  getSubmissions: (id: string) =>
    axiosClient.get<PracticeSubmissionDto[]>(`/practice/${id}/submissions`),
};
