import { router } from "expo-router";
import { create } from "zustand";
import { UserPayload } from "../../types/auth.types";
import { storage } from "../storage";

interface AuthState {
  token: string | null;
  user: UserPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserPayload) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // true na start, dopóki hydrate() nie skończy

  login: async (token: string, user: UserPayload) => {
    // Zapis na dysku (SecureStore dla tokena, AsyncStorage/SecureStore dla usera)
    await storage.saveToken(token);
    await storage.saveUser(JSON.stringify(user));

    set({
      token,
      user,
      isAuthenticated: true,
    });
    router.replace("/");
  },

  logout: async () => {
    // Czyścimy dysk
    await storage.clearToken();
    await storage.removeUser();

    // Czyścimy RAM
    set({ token: null, user: null, isAuthenticated: false });

    router.replace("/login");
  },

  hydrate: async () => {
    try {
      const token = await storage.getToken();
      const userRaw = await storage.getUser();

      if (token && userRaw) {
        // Jeśli mamy i token i dane usera na dysku jesteśmy zalogowani
        const user: UserPayload = JSON.parse(userRaw);
        set({ token, user, isAuthenticated: true });
      } else {
        // Zabezpieczenie: jeśli jest token, ale nie ma usera
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
