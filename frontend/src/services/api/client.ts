import axios from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const API_URL =
  envApiUrl && envApiUrl !== "undefined"
    ? envApiUrl
    : Platform.select({
        ios: "http://172.20.10.2:5076/api",
        android: "http://10.0.2.2:5076/api",
        default: "http://localhost:5076/api",
      });

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
console.log("API_URL:", API_URL);

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
    if (error.response?.status === 401 && useAuthStore.getState().token) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
