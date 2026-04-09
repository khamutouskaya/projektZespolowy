import * as Notifications from "expo-notifications";

// Jak powiadomienia mają wyglądać gdy aplikacja jest otwarta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  requestPermissionAndSchedule: async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return false;

    await notificationService.scheduleDailyReminder();
    return true;
  },

  scheduleDailyReminder: async (): Promise<void> => {
    // Anuluj poprzednie żeby nie duplikować
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Jak minął Twój dzień? ☁️",
        body: "Pamiętaj, żeby zapisać swoje przemyślenia w dzienniku.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21,
        minute: 0,
      },
    });
  },

  sendLocal: async (title: string, body: string): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // natychmiastowe
    });
  },
};
