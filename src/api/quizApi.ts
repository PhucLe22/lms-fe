import axiosClient from "./axiosClient";
import type { QuizDto, CreateQuizRequest, QuizSubmitRequest, QuizResultDto } from "../types";

export const quizApi = {
  getByLesson: (lessonId: string) =>
    axiosClient.get<QuizDto[]>(`/lessons/${lessonId}/quiz`),

  getByLessonAdmin: (lessonId: string) =>
    axiosClient.get<QuizDto[]>(`/lessons/${lessonId}/quiz/admin`),

  create: (lessonId: string, data: CreateQuizRequest) =>
    axiosClient.post<QuizDto>(`/lessons/${lessonId}/quiz`, data),

  update: (quizId: string, data: CreateQuizRequest) =>
    axiosClient.put<QuizDto>(`/quiz/${quizId}`, data),

  delete: (quizId: string) =>
    axiosClient.delete(`/quiz/${quizId}`),

  submit: (lessonId: string, data: QuizSubmitRequest) =>
    axiosClient.post<QuizResultDto>(`/quiz/submit/${lessonId}`, data),

  getResult: (lessonId: string) =>
    axiosClient.get<QuizResultDto>(`/quiz/result/${lessonId}`),
};
