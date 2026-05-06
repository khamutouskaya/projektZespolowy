import { apiClient } from "@/services/api/client";
import { QuizAnswer, QuizQuestion, QuizResult } from "./psychotype.types";

export const psychotypeService = {
  getQuestions: async (): Promise<QuizQuestion[]> => {
    const { data } = await apiClient.get<QuizQuestion[]>("/quiz/questions");
    return data;
  },

  submitAnswers: async (answers: QuizAnswer[]): Promise<QuizResult> => {
    const { data } = await apiClient.post<QuizResult>("/quiz/submit", { answers });
    return data;
  },
};
