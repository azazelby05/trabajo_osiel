import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5560/api",
  withCredentials: true,
});

export function getApiError(err, fallback = "Request failed.") {
  if (!err?.response) {
    return "Cannot reach API. Start backend: cd backend && npm run dev (port 5560).";
  }
  const { status, data } = err.response;
  if (typeof data?.message === "string") return data.message;
  if (typeof data === "string" && data.includes("Cannot GET")) {
    return `API route not found (${status}). Restart backend after code changes.`;
  }
  if (status === 401) return "Please log in again.";
  if (status === 403) return "Manager or admin access required for reports.";
  return fallback;
}

export default api;
