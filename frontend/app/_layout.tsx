import { router } from "expo-router";
import { useEffect } from "react";
import { useNetworkStatus } from "../src/hooks/useNetworkStatus";
import { useAuthStore } from "../src/services/store/useAuthStore";

function AppInit() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return; // czekaj aż hydrate skończy

    if (!isAuthenticated && !isOnline) {
      // brak tokena + brak sieci = nie ma co zrobić
      router.replace("/login");
    }
  }, [isAuthenticated, isOnline, isLoading]);

  return null;
}
