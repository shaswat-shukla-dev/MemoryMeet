import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export const addMeeting = (data) => api.post("/meeting", data).then((r) => r.data);
export const getStats = () => api.get("/stats").then((r) => r.data);
export const getContacts = () => api.get("/contacts").then((r) => r.data);
export const getMeetingsForContact = (name) => api.get(`/meetings/${encodeURIComponent(name)}`).then((r) => r.data);
export const getBrief = (data) => api.post("/brief", data).then((r) => r.data);
export const getInsights = (data) => api.post("/insights", data).then((r) => r.data);
export const healthCheck = () => api.get("/health").then((r) => r.data);
