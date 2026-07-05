import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the student or admin token (whichever is present) to every request
api.interceptors.request.use((config) => {
  const studentToken = localStorage.getItem("studentToken");
  const adminToken = localStorage.getItem("adminToken");

  if (config.url?.startsWith("/admin") && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (studentToken) {
    config.headers.Authorization = `Bearer ${studentToken}`;
  }

  return config;
});

// Safety net: if the backend blocks a request because the student is still
// on the default password, send them to the change-password page even if
// local state thought otherwise.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.code === "PASSWORD_CHANGE_REQUIRED") {
      if (window.location.pathname !== "/change-password") {
        window.location.href = "/change-password";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
