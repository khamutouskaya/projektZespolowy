import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  notificationsEnabled: "settings_notifications_enabled",
};

export const settingsStorage = {
  getNotificationsEnabled: async (): Promise<boolean> => {
    const val = await AsyncStorage.getItem(KEYS.notificationsEnabled);
    return val === null ? true : val === "true"; // domyślnie włączone
  },
  setNotificationsEnabled: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(KEYS.notificationsEnabled, String(enabled));
  },
};
