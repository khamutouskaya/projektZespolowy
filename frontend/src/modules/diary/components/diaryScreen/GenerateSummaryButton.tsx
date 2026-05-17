import React, { useState } from "react";
import { Pressable, StyleSheet, Alert } from "react-native";
import { colors } from "@/shared/theme/colors";
import { diaryApi } from "@/services/api/diaryApi";
import { diarySyncService } from "@/modules/diary/services/diarySyncService";
import { streakApi } from "@/services/api/streakApi";
import { useAuthStore } from "@/services/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import SummaryLoadingOverlay from "./SummaryLoadingOverlay";

type Props = {
  onGenerated?: () => void;
  todayEntriesContent?: string;
};

export default function GenerateSummaryButton({ onGenerated, todayEntriesContent = "" }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);

  const handleGenerate = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      await diarySyncService.syncPending(userId);
      await diaryApi.generateSummary(new Date().toISOString(), todayEntriesContent);
      await diarySyncService.fullSync(userId);

      // Trigger streak check after both journal entry and summary are on backend
      try {
        await streakApi.triggerDaily();
      } catch {
        // Streak trigger is best-effort — don't block the user
      }

      Alert.alert("Sukces", "Wygenerowano podsumowanie dnia!");
      onGenerated?.();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Błąd", "Nie udało się wygenerować podsumowania.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SummaryLoadingOverlay visible={isLoading} />
      <Pressable style={[styles.button, isLoading && styles.buttonLoading]} onPress={handleGenerate} disabled={isLoading}>
        <Ionicons name="sparkles-outline" size={24} color={colors.text.primary} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "hsl(40, 80%, 85%)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonLoading: {
    opacity: 0.5,
  },
});
