import { apiClient } from "./client";

export const diaryApi = {
  fetchSummary: async (entryId: string): Promise<string | null> => {
    const response = await apiClient.get(`/diary/${entryId}/summary`);
    return response.data?.summary ?? null;
  },

  create: async (entry: object) => {
    const response = await apiClient.post("/diary", entry);
    return response.data;
  },

  update: async (id: string, entry: object) => {
    const response = await apiClient.put(`/diary/${id}`, entry);
    return response.data;
  },
};
