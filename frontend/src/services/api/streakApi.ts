import { apiClient } from "./client";

export type DailyStatus = {
  hasJournalEntry: boolean;
  hasDaySummary: boolean;
  progress: number;
  fruitsBalance: number;
  hasPendingFruit: boolean;
  streakCount: number;
  coinsBalance: number;
};

export const streakApi = {
  async getDailyStatus(): Promise<DailyStatus> {
    const res = await apiClient.get("/streak/daily-status");
    return res.data;
  },

  async claimFruit(): Promise<{ fruitsBalance: number }> {
    const res = await apiClient.post("/streak/claim-fruit");
    return res.data;
  },

  async triggerDaily(): Promise<void> {
    await apiClient.post("/streak/daily");
  },
};
