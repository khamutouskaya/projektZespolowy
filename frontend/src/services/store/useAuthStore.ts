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
