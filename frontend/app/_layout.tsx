<<<<<<< HEAD
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "../src/services/store/useAuthStore";

const queryClient = new QueryClient();

function AppInit() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInit />
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
=======
import { useAuthStore } from "@/src/store/useAuthStore";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return <Stack />;
>>>>>>> 34bd785 (Przywrócenie wcześniejszego stanu maina)
}
