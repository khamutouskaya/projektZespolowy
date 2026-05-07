import { DiaryEntry } from "../diary.types";
import { apiClient } from "@/services/api/client";
import { diaryService } from "./diaryService";

const toApiPayload = (entry: DiaryEntry) => ({
  title: entry.title ?? "",
  content: entry.content,
  //moodScore: Number(entry.mood) || 0, //TODO, zobaczyć czy się zgadza mood - moodScore ????
  emotions: entry.tags ?? "[]", // tags - emotions
  isSummary: false,
  entryDate: new Date(entry.updatedAt).toISOString(),
});

const fromApiResponse = (data: any, userId: string): Partial<DiaryEntry> => ({
  serverId: data.id,
  title: data.title,
  content: data.content,
  //mood: String(data.moodScore ?? ""),
  tags: data.emotions ?? "[]",
  isSummary: data.isSummary,
  updatedAt: data.entryDate ?? new Date().toISOString(),
  syncStatus: "synced",
  userId,
});

export const diarySyncService = {
  // Wypchnij wszystkie pending wpisy na serwer
  syncPending: async (userId: string): Promise<void> => {
    const pending = diaryService.getPending(userId);
    for (const entry of pending) {
      try {
        if (entry.serverId) {
          await apiClient.put(
            `/journal/${entry.serverId}`,
            toApiPayload(entry),
          );
          diaryService.markSynced(entry.id, entry.serverId);
        } else {
          const response = await apiClient.post(
            "/journal",
            toApiPayload(entry),
          );
          diaryService.markSynced(entry.id, response.data.id); // tylko raz, z poprawnym ID
        }
      } catch (e) {
        console.warn(`[SYNC] Błąd synchronizacji wpisu ${entry.id}:`, e);
      }
    }
  },

  // Pobierz wpisy z serwera i zapisz lokalnie
  fetchFromServer: async (userId: string): Promise<void> => {
    try {
      const response = await apiClient.get("/journal");
      const serverEntries: any[] = response.data;

      for (const serverEntry of serverEntries) {
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
          // Nowy wpis z serwera — zapisz lokalnie
          diaryService.createFromServer(userId, serverEntry);
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
