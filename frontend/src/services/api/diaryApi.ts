import { apiClient } from "./client";

export const diaryApi = {
  generateSummaryText: async (dateString: string, dailyAnswers: string = ""): Promise<string> => {
    const response = await apiClient.post<{ text: string }>("/journal/daily-summary/generate-text", {
      date: dateString,
      dailyAnswers,
    });
    return response.data.text;
  },
  generateSummary: async (dateString: string, dailyAnswers: string = "") => {
    const response = await apiClient.post("/journal/daily-summary/generate", {
      date: dateString,
      dailyAnswers,
    });
    return response.data;
  },
  fetchSummary: async (date: string): Promise<string | null> => {
    const response = await apiClient.get(`/journal/summary/${date}`);
    return response.data?.summary ?? null;
  },
  create: async (entry: object) => {
    const response = await apiClient.post("/journal", entry);
    return response.data;
  },
  update: async (id: string, entry: object) => {
    const response = await apiClient.put(`/journal/${id}`, entry);
    return response.data;
  },
};
