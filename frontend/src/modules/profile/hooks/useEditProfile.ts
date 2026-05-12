import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/services/store/useAuthStore";
import { apiClient } from "@/services/api/client";

export function useEditProfile() {
  const user = useAuthStore((s) => s.user);
  const loginSilent = useAuthStore((s) => s.loginSilent);
  const token = useAuthStore((s) => s.token);

  const [editVisible, setEditVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName ?? "");
  const [editLastName, setEditLastName] = useState(user?.lastName ?? "");
  const [editStep, setEditStep] = useState<"main" | "password">("main");
  const [directPasswordEntry, setDirectPasswordEntry] = useState(false);

  const openEdit = () => {
    setEditFirstName(user?.firstName ?? "");
    setEditLastName(user?.lastName ?? "");
    setEditStep("main");
    setEditVisible(true);
  };

  const openPasswordChange = () => {
    setEditStep("password");
    setDirectPasswordEntry(true);
    setEditVisible(true);
  };

  const closeModal = () => {
    setEditVisible(false);
    setTimeout(() => {
      setEditStep("main");
      setDirectPasswordEntry(false);
    }, 280);
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Brak dostępu", "Zezwól na dostęp do zdjęć w ustawieniach.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        await apiClient.put("/users/me", { avatar: base64 });
        if (token && user) await loginSilent(token, { ...user, avatar: base64 });
      } catch {
        Alert.alert("Błąd", "Nie udało się zapisać avatara");
      }
    }
  };

  const saveProfile = async () => {
    try {
      await apiClient.put("/users/me", {
        firstName: editFirstName,
        lastName: editLastName,
      });
      if (token && user) {
        await loginSilent(token, {
          ...user,
          firstName: editFirstName,
          lastName: editLastName,
        });
      }
      setEditVisible(false);
    } catch {
      Alert.alert("Błąd", "Nie udało się zapisać danych");
    }
  };

  return {
    editVisible,
    editFirstName, setEditFirstName,
    editLastName,  setEditLastName,
    editStep,      setEditStep,
    directPasswordEntry,
    openEdit,
    openPasswordChange,
    closeModal,
    pickAvatar,
    saveProfile,
  };
}
