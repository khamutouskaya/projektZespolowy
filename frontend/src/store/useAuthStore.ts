import { router } from "expo-router";
import { create } from "zustand";
import { storage } from "../api/storage";
import { UserPayload } from "../types/auth.types";

const USER_KEY = "auth_user";

interface AuthState {
  token: string | null;
  user: UserPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: UserPayload) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (accessToken: string, user: UserPayload) => {
    await storage.saveTokens(accessToken, "");
    await storage.saveUser(JSON.stringify(user));
    set({
      token: accessToken,
      user,
      isAuthenticated: true,
    });
    router.replace("/(tabs)");
  },

  logout: async () => {
    await storage.clearTokens();
    set({ token: null, user: null, isAuthenticated: false });
    router.replace("/(tabs)"); //TODO: zmień na /(auth)/login gdy ekran będzie gotowy
  },

  hydrate: async () => {
    try {
      const token = await storage.getToken();
      const userRaw = await storage.getUser();
      if (token && userRaw) {
        const user: UserPayload = JSON.parse(userRaw);
        set({ token, user, isAuthenticated: true });
      }
    } catch (e) {
      console.error("Błąd hydratacji:", e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
