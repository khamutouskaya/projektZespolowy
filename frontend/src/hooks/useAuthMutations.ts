import { useMutation } from "@tanstack/react-query";
import { authApi, LoginRequest, RegisterRequest } from "../services/api/auth";
import { useAuthStore } from "../services/store/useAuthStore";
import { useToastStore } from "../services/store/useToastStore";

// Hook do logowania
export const useLoginMutation = () => {
  const loginToStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: async (data) => {
      await loginToStore(data.token, data.user);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message;
      useToastStore.getState().show(
        "Nie udało się zalogować",
        msg || "Sprawdź email i hasło i spróbuj ponownie.",
        "error",
      );
    },
  });
};

// Hook do rejestracji
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (credentials: RegisterRequest) => authApi.register(credentials),
    onSuccess: () => {},
    onError: (error: any) => {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      const friendlyMsg =
        status === 409 || (msg && msg.toLowerCase().includes("exist"))
          ? "Konto z tym adresem email już istnieje. Zaloguj się lub użyj innego emaila."
          : msg || "Nie udało się utworzyć konta. Spróbuj ponownie.";
      useToastStore.getState().show("Błąd rejestracji", friendlyMsg, "error");
    },
  });
};
