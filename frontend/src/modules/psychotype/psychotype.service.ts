import { apiClient } from "@/services/api/client";
import { PersonalityAnswer, PersonalityQuestion, PersonalityResult } from "./psychotype.types";
import type { WelcomeReward } from "@/services/api/streakApi";

export const psychotypeService = {
  getQuestions: async (): Promise<PersonalityQuestion[]> => {
    const { data } = await apiClient.get<PersonalityQuestion[]>("/personality/questions");
    return data;
  },

  submitAnswers: async (answers: PersonalityAnswer[]): Promise<PersonalityResult & { welcomeReward?: WelcomeReward }> => {
    const { data } = await apiClient.post<PersonalityResult & { welcomeReward?: WelcomeReward }>("/personality/submit", { answers });
    return data;
  },

  getProfile: async (): Promise<PersonalityResult | null> => {
    try {
      const { data } = await apiClient.get<PersonalityResult>("/personality/profile");
      return data;
    } catch {
      return null;
    }
  },
};
