import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/services/store/useAuthStore";
import { diaryApi } from "@/services/api/diaryApi";
import { diaryService } from "../services/diaryService";

export const useDiarySummarySync = (onSynced?: () => void) => {
  const user = useAuthStore((state) => state.user);
  const isSyncing = useRef(false);

  const syncSummaries = async () => {
    if (!user?.id || isSyncing.current) return;
    isSyncing.current = true;

    try {
      // Pobierz wszystkie wpisy bez aiSummary i bez własnego preview
      const entries = diaryService.getAll(user.id);
      const needsSummary = entries.filter((e) => !e.preview);

      for (const entry of needsSummary) {
        try {
          const summary = await diaryApi.fetchSummary(entry.id);
          if (summary) {
            diaryService.update(entry.id, user.id, { preview: summary });
            onSynced?.(); // odśwież widok po każdym sukcesie
          }
        } catch {
          // pojedynczy wpis nie blokuje reszty
        }
      }
    } finally {
      isSyncing.current = false;
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // Sync przy powrocie aplikacji z tła
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") syncSummaries();
    });

    // Sync przy odzyskaniu połączenia
    const netInfoUnsub = NetInfo.addEventListener((netState) => {
      if (netState.isConnected) syncSummaries();
    });

    // Sync przy pierwszym montowaniu
    syncSummaries();

    return () => {
      appStateSub.remove();
      netInfoUnsub();
    };
  }, [user?.id]);
};
