import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { authApi, LoginRequest } from "../services/api/auth";
import { useAuthStore } from "../services/store/useAuthStore";

// Hook do logowania
export const useLoginMutation = () => {
  const loginToStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: async (data) => {
      // Zapisujemy token i usera w store (store zrobi router.replace)
      await loginToStore(data.token, data.user);
    },
    onError: (error: any) => {
      Alert.alert(
        "Błąd logowania",
        error.response?.data?.message || "Nieprawidłowy email lub hasło.",
      );
      console.log("Błąd logowania");
    },
  });
};

// Hook do rejestracji
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.register(credentials),
    onSuccess: () => {
      Alert.alert(
        "Sukces!",
        "Konto zostało utworzone. Możesz się teraz zalogować.",
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Błąd rejestracji",
        error.response?.data?.message || "Użytkownik już istnieje.",
      );
      console.log("Błąd rejestracji");
      console.log("[REGISTER] Status:", error.response?.status);
      console.log("[REGISTER] Body:", JSON.stringify(error.response?.data));
      console.log("[REGISTER] Message:", error.message);
      console.log("[REGISTER] Config URL:", error.config?.url);
      console.log("[REGISTER] Config BaseURL:", error.config?.baseURL);
    },
  });
};
