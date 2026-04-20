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

  const load = useCallback(() => {
    if (!userId || !ready) return;
    const data = diaryService.getAll(userId);
    setEntries(data);
  }, [userId, ready]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    (data: Partial<DiaryEntry>) => {
      if (!userId) return;
      diaryService.create(userId, data);
      load();
    },
    [userId, load],
  );

  const updateEntry = useCallback(
    (id: string, data: Partial<DiaryEntry>) => {
      if (!userId) return;
      diaryService.update(id, userId, data);
      load();
    },
    [userId, load],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      if (!userId) return;
      diaryService.delete(id, userId);
      load();
    },
    [userId, load],
  );

  return { entries, addEntry, updateEntry, deleteEntry, reload: load };
};
