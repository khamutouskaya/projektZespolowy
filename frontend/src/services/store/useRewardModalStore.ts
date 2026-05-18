import { create } from "zustand";

export type RewardType = "note" | "task" | "video" | "quiz";

interface RewardModalState {
  visible: boolean;
  coinsAwarded: number;
  rewardType: RewardType | null;
  show: (coinsAwarded: number, rewardType: RewardType) => void;
  hide: () => void;
}

export const useRewardModalStore = create<RewardModalState>((set) => ({
  visible: false,
  coinsAwarded: 0,
  rewardType: null,
  show: (coinsAwarded, rewardType) => set({ visible: true, coinsAwarded, rewardType }),
  hide: () => set({ visible: false }),
}));
