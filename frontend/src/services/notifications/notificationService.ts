import * as Notifications from "expo-notifications";
import { NotificationSettings } from "@/services/store/settingsStorage";

export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  },

  reschedule: async (settings: NotificationSettings): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.allEnabled) return;
    if (settings.mutedUntil) {
      const mutedUntil = new Date(settings.mutedUntil);
      if (mutedUntil > new Date()) return;
    }

    if (settings.diaryEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Jak minął Twój dzień? ☁️",
          body: "Pamiętaj, żeby zapisać swoje przemyślenia w dzienniku.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: settings.diaryHour,
          minute: settings.diaryMinute,
          channelId: "diary-reminders",
        },
      });
    }
  },
};
