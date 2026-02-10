import axios from "axios";

// Health endpoints live at /health, not under /api
const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5038/api").replace(/\/api$/, "");

export interface HealthEntry {
  status: string;
  description?: string | null;
  data?: Record<string, unknown>;
}

export interface HealthReport {
  status: string; // "Healthy" | "Degraded" | "Unhealthy"
  totalDuration: string;
  entries: Record<string, HealthEntry>;
}

export const healthApi = {
  getHealth: () => axios.get<HealthReport>(`${baseUrl}/health`),
  getLive: () => axios.get<string>(`${baseUrl}/health/live`),
  getReady: () => axios.get<HealthReport>(`${baseUrl}/health/ready`),
};
