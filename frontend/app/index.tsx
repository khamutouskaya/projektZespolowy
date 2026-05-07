import { useAuthStore } from "@/services/store/useAuthStore";
import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return null;

  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/login"} />;
}
