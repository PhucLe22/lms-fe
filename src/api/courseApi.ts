import axiosClient from "./axiosClient";
import type {
  CourseDto,
  CourseDetailDto,
  CreateCourseRequest,
  UpdateCourseRequest,
  PaginatedResult,
} from "../types";

export const courseApi = {
  getAll: (page = 1, pageSize = 10, search?: string) =>
    axiosClient.get<PaginatedResult<CourseDto>>("/courses", {
      params: { page, pageSize, search },
    }),

  getById: (id: string) =>
    axiosClient.get<CourseDetailDto>(`/courses/${id}`),

  create: (data: CreateCourseRequest) =>
    axiosClient.post<CourseDto>("/courses", data),

  update: (id: string, data: UpdateCourseRequest) =>
    axiosClient.put<CourseDto>(`/courses/${id}`, data),

  delete: (id: string) =>
    axiosClient.delete(`/courses/${id}`),
};
