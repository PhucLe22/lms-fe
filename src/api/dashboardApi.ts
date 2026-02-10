import axiosClient from "./axiosClient";
import type { DashboardDto } from "../types";

export const dashboardApi = {
  get: () => axiosClient.get<DashboardDto>("/dashboard"),
};
