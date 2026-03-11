import { useMutation } from "@tanstack/react-query";
import { authApi, LoginRequest } from "../services/api/auth";
import { useAuthStore } from "../services/store/useAuthStore";

export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: async (data) => {
      await loginToStore(data.token, data.user);
    },
    onError: (error) => {
      console.log("Błąd logowania", error);
    },
  });
};
