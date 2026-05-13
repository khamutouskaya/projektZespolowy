import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Visit } from "../../modules/visits/visits.types";

const storageKey = (userId: string) => `visits_${userId}`;

interface VisitState {
  visits: Visit[];
  currentUserId: string | null;
  loadForUser: (userId: string) => Promise<void>;
  addVisit: (visit: Visit) => void;
  cancelVisit: (visitId: string) => void;
  reset: () => void;
}

const persist = async (userId: string | null, visits: Visit[]) => {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(visits));
  } catch (e) {
    console.error("Failed to save visits", e);
  }
};

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  currentUserId: null,

  loadForUser: async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(userId));
      const visits: Visit[] = raw ? JSON.parse(raw) : [];
      set({ visits, currentUserId: userId });
    } catch (e) {
      console.error("Failed to load visits", e);
      set({ visits: [], currentUserId: userId });
    }
  },

  addVisit: (visit) => {
    set((state) => {
      const visits = [visit, ...state.visits];
      persist(state.currentUserId, visits);
      return { visits };
    });
  },

  cancelVisit: (visitId) => {
    set((state) => {
      const visits = state.visits.map((v) =>
        v.id === visitId ? { ...v, status: "cancelled" as const } : v,
      );
      persist(state.currentUserId, visits);
      return { visits };
    });
  },

  reset: () => set({ visits: [], currentUserId: null }),
}));
