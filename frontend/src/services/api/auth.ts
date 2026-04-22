import { UserPayload } from "../../types/auth.types";
import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
}

export interface LoginResponse {
  token: string;
  user: UserPayload;
}

export const onboardingApi = {
  saveAnswers: async (answers: Record<string, string[]>): Promise<void> => {
    await apiClient.post("/users/me/onboarding", { answers });
  },
};
export const usersApi = {
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => {
    const response = await apiClient.put("/users/me", data);
    return response.data;
  },
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  register: async (credentials: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/register", {
      ...credentials,
      personalityType: "balanced",
    });
    return response.data;
  },
};
