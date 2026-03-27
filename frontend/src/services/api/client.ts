import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL =
  `${process.env.EXPO_PUBLIC_API_URL}` || "http://10.0.2.2:5076/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Doklejanie tokena do każdego requestu
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Wyloguj jeśli token wygasł
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
