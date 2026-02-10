import axiosClient from "./axiosClient";
import type { StudentListDto, StudentDetailDto, PaginatedResult } from "../types";

export const adminApi = {
  getStudents: (page = 1, pageSize = 10, search?: string) =>
    axiosClient.get<PaginatedResult<StudentListDto>>("/admin/students", {
      params: { page, pageSize, search },
    }),

  getStudent: (id: string) =>
    axiosClient.get<StudentDetailDto>(`/admin/students/${id}`),

  deleteStudent: (id: string) =>
    axiosClient.delete(`/admin/students/${id}`),

  updateRole: (id: string, role: string) =>
    axiosClient.put<StudentListDto>(`/admin/students/${id}/role`, { role }),
};
