import { useState } from "react";
import { Alert } from "react-native";
import { useAuthStore } from "@/services/store/useAuthStore";
import { apiClient } from "@/services/api/client";

export function usePasswordReset(onSuccess: () => void) {
  const user = useAuthStore((s) => s.user);

  const [passwordStep, setPasswordStep] = useState<"email" | "reset">("email");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSending, setIsSending] = useState(false);

  const reset = () => {
    setPasswordStep("email");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const sendResetEmail = async () => {
    if (!user?.email) return;
    setIsSending(true);
    try {
      await apiClient.post("/auth/forgot-password", { email: user.email });
      setPasswordStep("reset");
    } catch (e: any) {
      Alert.alert("Błąd", e.response?.data?.message ?? "Nie udało się wysłać emaila");
    } finally {
      setIsSending(false);
    }
  };

  const resetPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword)
      return Alert.alert("Błąd", "Wypełnij wszystkie pola");
    if (newPassword !== confirmPassword)
      return Alert.alert("Błąd", "Hasła nie są zgodne");
    if (newPassword.length < 6)
      return Alert.alert("Błąd", "Hasło musi mieć co najmniej 6 znaków");
    try {
      await apiClient.post("/auth/reset-password", { token: resetToken, newPassword });
      Alert.alert("Sukces", "Hasło zostało zmienione");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Błąd", e.response?.data?.message ?? "Nieprawidłowy lub wygasły token");
    }
  };

  return {
    passwordStep, setPasswordStep,
    resetToken,   setResetToken,
    newPassword,  setNewPassword,
    confirmPassword, setConfirmPassword,
    isSending,
    reset,
    sendResetEmail,
    resetPassword,
    userEmail: user?.email,
  };
}
