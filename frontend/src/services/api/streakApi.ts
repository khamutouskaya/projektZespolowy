import { apiClient } from "./client";

export type WelcomeReward = {
  granted: boolean;
  coinsAwarded: number;
  rewardType: string;
};

export type DailyStatus = {
  hasJournalEntry: boolean;
  hasDaySummary: boolean;
  progress: number;
  fruitsBalance: number;
  hasPendingFruit: boolean;
  streakCount: number;
  coinsBalance: number;
  hasDailyFruitUsed: boolean;
  hasDailyRewardClaimed: boolean;
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

  async claimDailyReward(rewardType: "coins" | "fruit"): Promise<{ coinsBalance: number; fruitsBalance: number }> {
    const res = await apiClient.post(`/streak/claim-daily-reward?rewardType=${rewardType}`);
    return res.data;
  },

  async triggerDaily(): Promise<void> {
    await apiClient.post("/streak/daily");
  },

  async trackVideoWatched(): Promise<WelcomeReward | null> {
    const res = await apiClient.post("/mental-support/video-watched");
    return res.data?.welcomeReward ?? null;
  },
};
