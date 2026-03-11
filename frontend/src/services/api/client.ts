import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// const API_URL = 'https://localhost:7127/api';
// 'http://localhost:5076/api'
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://localhost:7127";
export const API_URL = `${BASE_URL}`;
console.log("Adres API to:", API_URL);

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

// Obsługa 401 - wyloguj jeśli token wygasł
apiClient.interceptors.response.use(
  (response: any) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
