import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NotificationSettings {
  allEnabled: boolean;
  diaryEnabled: boolean;
  mutedUntil: string | null;
  diaryHour: number;
  diaryMinute: number;
}

const KEYS = {
  notificationSettings: "settings_notifications",
};

const DEFAULTS: NotificationSettings = {
  allEnabled: true,
  diaryEnabled: true,
  mutedUntil: null,
  diaryHour: 21,
  diaryMinute: 0,
};

export const settingsStorage = {
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const val = await AsyncStorage.getItem(KEYS.notificationSettings);
    return val ? { ...DEFAULTS, ...JSON.parse(val) } : DEFAULTS;
  },
  saveNotificationSettings: async (
    settings: Partial<NotificationSettings>,
  ): Promise<void> => {
    const current = await settingsStorage.getNotificationSettings();
    await AsyncStorage.setItem(
      KEYS.notificationSettings,
      JSON.stringify({ ...current, ...settings }),
    );
  },
};
