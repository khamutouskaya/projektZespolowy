import { useCallback, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { settingsStorage } from "@/services/store/settingsStorage";
import { notificationService } from "@/services/notifications/notificationService";

export const useNotificationSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsStorage.getNotificationsEnabled().then((val) => {
      setEnabled(val);
      setLoading(false);
    });
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    await settingsStorage.setNotificationsEnabled(next);

    if (next) {
      await notificationService.requestPermissionAndSchedule();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [enabled]);

  return { enabled, loading, toggle };
};
