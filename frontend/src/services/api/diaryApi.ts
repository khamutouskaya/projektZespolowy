import { apiClient } from "./client";

export const diaryApi = {
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
