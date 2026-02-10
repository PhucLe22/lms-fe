import axiosClient from "./axiosClient";
import type { EnrollmentDto } from "../types";

export const enrollmentApi = {
  enroll: (courseId: string) =>
    axiosClient.post<EnrollmentDto>(`/enrollments/${courseId}`),

  myCourses: () =>
    axiosClient.get<EnrollmentDto[]>("/enrollments/my-courses"),

  unenroll: (courseId: string) =>
    axiosClient.delete(`/enrollments/${courseId}`),
};
