import { DiaryEntry } from "../diary.types";
import { apiClient } from "@/services/api/client";
import { diaryService } from "./diaryService";
import type { WelcomeReward } from "@/services/api/streakApi";

const toApiPayload = (entry: DiaryEntry) => ({
  title: entry.title ?? "",
  content: entry.content,
  preview: entry.preview ?? null,
  emotions: entry.tags ?? "[]",
  isSummary: false,
  entryDate: new Date(entry.updatedAt).toISOString(),
});

const fromApiResponse = (data: any, userId: string): Partial<DiaryEntry> => ({
  serverId: data.id,
  title: data.title,
  content: data.content,
  preview: data.preview ?? undefined,
  tags: data.emotions ?? "[]",
  isSummary: data.isSummary,
  updatedAt: data.entryDate ?? new Date().toISOString(),
  syncStatus: "synced",
  userId,
});

let syncPendingRunning = false;
// Blokada na poziomie sesji: zapobiega pojawieniu się toastu powitalnej nagrody więcej niż raz
// podczas jednej sesji, nawet jeśli odpowiedź serwera zostanie zduplikowana.
let welcomeRewardShownThisSession = false;

export const diarySyncService = {
  // Wypchnij wszystkie pending wpisy na serwer
  // Zwraca pierwszą otrzymaną nagrodę powitalną (jeśli istnieje)
  syncPending: async (userId: string): Promise<WelcomeReward | null> => {
    if (syncPendingRunning) return null;
    syncPendingRunning = true;
    let earnedReward: WelcomeReward | null = null;
    try {
      const pending = diaryService.getPending(userId);
      if (pending.length === 0) return null;

      const syncOne = async (entry: (typeof pending)[number]) => {
        if (entry.serverId) {
          await apiClient.put(`/journal/${entry.serverId}`, toApiPayload(entry));
          diaryService.markSynced(entry.id, entry.serverId);
        } else {
          const response = await apiClient.post("/journal", toApiPayload(entry));
          diaryService.markSynced(entry.id, response.data.id);
          const reward: WelcomeReward | undefined = response.data.welcomeReward;
          if (reward?.granted && !earnedReward && !welcomeRewardShownThisSession) {
            earnedReward = reward;
            welcomeRewardShownThisSession = true;
          }
        }
      };

      const results = await Promise.allSettled(pending.map(syncOne));
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.warn(`[SYNC] Błąd synchronizacji wpisu ${pending[i].id}:`, result.reason);
        }
      });
    } finally {
      syncPendingRunning = false;
    }
    return earnedReward;
  },

  // Pobierz wpisy z serwera i zapisz lokalnie
  fetchFromServer: async (userId: string): Promise<void> => {
    try {
      const response = await apiClient.get("/journal");
      const serverEntries: any[] = response.data;

      for (const serverEntry of serverEntries) {
        // Wpisy isSummary nie są osobnymi notatkami — pomijamy je
        if (serverEntry.isSummary) continue;

        // Sprawdź czy już mamy ten wpis lokalnie (po serverId)
        const existing = diaryService.getByServerId(serverEntry.id, userId);
        if (existing) {
          // Aktualizuj jeśli serwer ma nowszą wersję
          const serverDate = new Date(serverEntry.entryDate).getTime();
          const localDate = new Date(existing.updatedAt).getTime();
          if (serverDate > localDate) {
            diaryService.update(
              existing.id,
              userId,
              fromApiResponse(serverEntry, userId),
            );
          }
        } else {
          // Przed utworzeniem sprawdź, czy istnieje lokalny wpis z tą samą datą (zapobiega duplikatom)
          const entryDate = new Date(serverEntry.entryDate).toLocaleDateString("pl-PL");
          const sameDay = diaryService
            .getAll(userId)
            .find((e) => e.date === entryDate && !e.isSummary && !serverEntry.isSummary);
          if (sameDay) {
            diaryService.update(sameDay.id, userId, fromApiResponse(serverEntry, userId));
            diaryService.markSynced(sameDay.id, serverEntry.id);
          } else {
            diaryService.createFromServer(userId, serverEntry);
          }
        }
      }
    } catch (e) {
      console.warn("[SYNC] Błąd pobierania wpisów z serwera:", e);
    }
  },

  // Pełna synchronizacja najpierw wypchnij lokalne, potem pobierz z serwera
  fullSync: async (userId: string): Promise<void> => {
    await diarySyncService.syncPending(userId);
    await diarySyncService.fetchFromServer(userId);
  },
};
