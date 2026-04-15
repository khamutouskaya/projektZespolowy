import NetInfo from "@react-native-community/netinfo";
import { apiClient } from "../api/client";

export const isOnline = async (): Promise<boolean> => {
  const net = await NetInfo.fetch();
  return !!net.isConnected;
};

export const isServerReachable = async (): Promise<boolean> => {
  try {
    await apiClient.get("/health", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};
export const canReachBackend = async (): Promise<boolean> => {
  const serverUp = await isServerReachable();
  if (serverUp) return true;

  // (rozróżnia: brak netu vs serwer down)
  const online = await isOnline();
  return online; // false = brak internetu, false też = serwer down ale net jest
};
