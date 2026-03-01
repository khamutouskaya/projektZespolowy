import { useAuthStore } from "@/src/store/useAuthStore";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return <Stack />;
}
