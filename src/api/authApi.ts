import axiosClient from "./axiosClient";
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "../types";

export const authApi = {
  register: (data: RegisterRequest) =>
    axiosClient.post<AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    axiosClient.post<AuthResponse>("/auth/login", data),

  getMe: () =>
    axiosClient.get<User>("/auth/me"),

  forgotPassword: (email: string) =>
    axiosClient.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    axiosClient.post<{ message: string }>("/auth/reset-password", { token, newPassword }),
};
