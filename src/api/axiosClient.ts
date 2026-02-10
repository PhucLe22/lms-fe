import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5038/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap ApiResponse wrapper: { success, data, message } → extract data
axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      response.data = body.data;
    }
    return response;
  },
);

// Retry on 429 with exponential backoff, handle 401 globally
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 429 && config) {
      const retryCount = config._retryCount ?? 0;
      if (retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        const retryAfter = error.response?.headers?.["retry-after"];
        const delayMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_BASE_MS * Math.pow(2, retryCount);
        await new Promise((r) => setTimeout(r, delayMs));
        return axiosClient(config);
      }
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { message: "Too many requests. Please try again later.", variant: "error" },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
