import { useCallback, useEffect, useState } from "react";
import {
  NotificationSettings,
  settingsStorage,
} from "@/services/store/settingsStorage";
import { notificationService } from "@/services/notifications/notificationService";

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    allEnabled: true,
    diaryEnabled: true,
    mutedUntil: null,
    diaryHour: 21,
    diaryMinute: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsStorage.getNotificationSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = useCallback(
    async (patch: Partial<NotificationSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await settingsStorage.saveNotificationSettings(patch);
      const granted = await notificationService.requestPermission();
      if (granted) await notificationService.reschedule(next);
    },
    [settings],
  );

  // Czy aktualnie wyciszone tymczasowo
  const isMutedTemporarily =
    !!settings.mutedUntil && new Date(settings.mutedUntil) > new Date();

  const muteUntil = useCallback(
    async (date: Date) => {
      await update({ mutedUntil: date.toISOString() });
    },
    [update],
  );

  const unmute = useCallback(async () => {
    await update({ mutedUntil: null });
  }, [update]);

  return { settings, loading, update, isMutedTemporarily, muteUntil, unmute };
};
