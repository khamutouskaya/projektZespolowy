import { router } from "expo-router";
import { jwtDecode } from "jwt-decode"; // do spr czasu tokena
import { create } from "zustand";
import { UserPayload } from "../../types/auth.types";
import { storage } from "../storage";
import NetInfo from "@react-native-community/netinfo";
import { canReachBackend } from "../network/networkUtils";

//useAuthStore — twój globalny store, z którego pobierany jest token.
// Ten store zarządza stanem autoryzacji użytkownika, przechowując token i dane usera zarówno w RAMie (stan aplikacji), jak i na dysku (SecureStore) dla trwałości sesji.

interface AuthState {
  token: string | null;
  user: UserPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserPayload) => Promise<void>;
  loginSilent: (token: string, user: UserPayload) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  buyPremium: () => Promise<void>;
  cancelPremium: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // true na start, dopóki hydrate() nie skończy

  login: async (token: string, user: UserPayload) => {
    await storage.saveToken(token);
    await storage.saveUser(JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
    router.replace("/");
  },

  loginSilent: async (token: string, user: UserPayload) => {
    await storage.saveToken(token);
    await storage.saveUser(JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    // Czyścimy dysk
    await storage.clearToken();
    await storage.removeUser();

    // Czyścimy RAM
    set({ token: null, user: null, isAuthenticated: false });

    router.replace("/login");
  },

  cancelPremium: async () => {
    const { apiClient } = require("../api/client");
    await apiClient.delete("/users/me/premium");
    const current = useAuthStore.getState().user;
    if (current) {
      const updated = { ...current, isPremium: false };
      await storage.saveUser(JSON.stringify(updated));
      set({ user: updated });
    }
  },

  buyPremium: async () => {
    const { apiClient } = require("../api/client");
    try {
      const response = await apiClient.post("/users/me/premium");
      console.log("[buyPremium] response:", JSON.stringify(response.data));
      const updatedUser: UserPayload = { ...response.data, isPremium: true };
      await storage.saveUser(JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (e: any) {
      console.error("[buyPremium] error status:", e?.response?.status);
      console.error("[buyPremium] error data:", JSON.stringify(e?.response?.data));
      console.error("[buyPremium] message:", e?.message);
      throw e;
    }
  },

  hydrate: async () => {
    try {
      const token = await storage.getToken();
      const userRaw = await storage.getUser();
      if (token) {
        // Do sprawdzenia czasu wygaśnięcia tokena, do testu czy nie ignoruje przeterminowanego tokenu
        const decoded: any = jwtDecode(token);
        console.log(
          "[TOKEN] Wygasa:",
          new Date(decoded.exp * 1000).toLocaleString(),
        );
      }
      if (token && userRaw) {
        const decoded: any = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          const reachable = await canReachBackend();
          if (reachable) {
            // Online + serwer działa + token wygasły → wyloguj
            await storage.clearToken();
            await storage.removeUser();
          } else {
            // Brak połączenia z serwerem → wpuść mimo wygasłego tokenu
            const user: UserPayload = JSON.parse(userRaw);
            set({ token, user, isAuthenticated: true });
            console.warn(
              "[TOKEN] Wygasły, ale serwer nieosiągalny — sesja tymczasowo aktywna",
            );
          }
        } else {
          // Token ważny — normalne logowanie
          const user: UserPayload = JSON.parse(userRaw);
          set({ token, user, isAuthenticated: true });
        }
      } else {
        if (token || userRaw) {
          await storage.clearToken();
          await storage.removeUser();
        }
      }
    } catch (e) {
      console.error("Błąd hydratacji (uszkodzony JSON usera?):", e);
      // W razie błędu parsowania JSONa czyścimy sesję
      await storage.clearToken();
      await storage.removeUser();
    } finally {
      set({ isLoading: false });
    }
  },
}));
