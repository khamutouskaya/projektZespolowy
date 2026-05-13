import "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../src/services/store/useAuthStore";
import * as Notifications from "expo-notifications";
import { settingsStorage } from "../src/services/store/settingsStorage";
import { notificationService } from "../src/services/notifications/notificationService";
import { setAudioModeAsync } from "expo-audio";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

function AppInit() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    setAudioModeAsync({ playsInSilentMode: true });

    Notifications.setNotificationChannelAsync("diary-reminders", {
      name: "Przypomnienia dziennika",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#375a85",
    });

    settingsStorage.getNotificationSettings().then(async (settings) => {
      await notificationService.requestPermission();
      await notificationService.reschedule(settings);
    });
  }, [hydrate]);

  return null;
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppInit />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            gestureEnabled: true,
            gestureDirection: "horizontal",
            headerShown: false,
          }}
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
