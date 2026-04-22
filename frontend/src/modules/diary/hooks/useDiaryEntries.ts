//decydujemy dane sa z backend czy mock
import { DiaryEntry } from "../diary.types";
import { diaryMock } from "../../../../mocks/diary.mock";

export function useDiaryEntries() {
  const entries: DiaryEntry[] = diaryMock;
  console.log("🔥 REAL HOOK FILE LOADED");

  useEffect(() => {
    initDiaryDb();
    setReady(true);
  }, []);

  const load = useCallback(async () => {
    if (!userId || !ready) return;

    // First, show local quickly
    setEntries(diaryService.getAll(userId));

    // Then try to sync
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

      // Need server id to delete it on backend if synced
      const entry = diaryService.getById(id, userId);
      diaryService.delete(id, userId);
      setEntries(diaryService.getAll(userId));

      if (entry && entry.serverId) {
        try {
          // You need to export delete from sync service or just do it here
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
