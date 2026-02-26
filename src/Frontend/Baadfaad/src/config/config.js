/**
 * @fileoverview Axios API Client Configuration
 * @description Creates and exports a pre-configured Axios instance for all
 *              backend API calls. Features:
 *              - Base URL pointing to the Express backend
 *              - Automatic JWT Bearer token injection from localStorage
 *              - Response interceptor that clears auth on 401/403 and
 *                redirects to /login
 *
 * @module config/config
 */
import axios from "axios";
export const API_URL = "http://localhost:5000/api";
export const BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const isAuthFailure =
      (status === 401 && message !== "Access denied") ||
      (status === 403 && message === "Invalid access token");

    if (isAuthFailure) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
