import { useAuthStore } from "@/services/store/useAuthStore";
import { useCallback, useEffect, useState } from "react";
import { initDiaryDb } from "../db/diaryDb";
import { DiaryEntry } from "../diary.types";
import { diaryService } from "../services/diaryService";
import { diarySyncService } from "../services/diarySyncService";

export const useDiaryEntries = () => {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDiaryDb();
    setReady(true);
  }, []);

  const load = useCallback(async () => {
    if (!userId || !ready) return;

    setEntries(diaryService.getAll(userId));

    try {
      await diarySyncService.fullSync(userId);
      setEntries(diaryService.getAll(userId));
    } catch (err) {
      console.warn("Failed to sync diary entries", err);
    }
  }, [userId, ready]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    async (data: Partial<DiaryEntry>) => {
      if (!userId) return;
      diaryService.create(userId, data);
      setEntries(diaryService.getAll(userId));

      try {
        await diarySyncService.syncPending(userId);
        setEntries(diaryService.getAll(userId));
      } catch (err) {
        console.warn("Failed to push sync pending diary entries", err);
      }
    },
    [userId],
  );

  const updateEntry = useCallback(
    async (id: string, data: Partial<DiaryEntry>) => {
      if (!userId) return;
      diaryService.update(id, userId, data);
      setEntries(diaryService.getAll(userId));

      try {
        await diarySyncService.syncPending(userId);
        setEntries(diaryService.getAll(userId));
      } catch (err) {
        console.warn("Failed to push sync pending diary entries", err);
      }
    },
    [userId],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!userId) return;

      const entry = diaryService.getById(id, userId);
      diaryService.delete(id, userId);
      setEntries(diaryService.getAll(userId));

      if (entry && entry.serverId) {
        try {
          const { apiClient } = await import("@/services/api/client");
          await apiClient.delete(`/journal/${entry.serverId}`);
        } catch (err) {
          console.warn("Failed to delete entry on server", err);
        }
      }
    },
    [userId],
  );

  return { entries, addEntry, updateEntry, deleteEntry, reload: load };
};
