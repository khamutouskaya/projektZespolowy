import { useAuthStore } from "../store/useAuthStore";
import { UserPayload } from "../types/auth.types";
import { apiClient } from "./apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserPayload;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

    const { token, user } = response.data;
    await useAuthStore.getState().login(token, user);

    return response.data;
  },

  register: async (credentials: LoginRequest): Promise<void> => {
    // TODO: dostosuj potem
    await apiClient.post("/auth/register", credentials);
  },
};
