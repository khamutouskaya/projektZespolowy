import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import NotificationsSettingsCard from "../components/profileScreen/NotificationsSettingsCard";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "../../../services/store/useAuthStore";
import { Alert } from "react-native";
import { useProfileStats } from "../hooks/useProfileStats";
import StatBox from "../components/profileScreen/StatBox";
import { useCallback } from "react";
import { useState } from "react";
import { Modal, TextInput } from "react-native";
import { apiClient } from "../../../services/api/client";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const [editVisible, setEditVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName ?? "");
  const [editLastName, setEditLastName] = useState(user?.lastName ?? "");
  const loginSilent = useAuthStore((state) => state.loginSilent);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { entryCount, memberSince, reload } = useProfileStats();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  const handleSaveProfile = async () => {
    try {
      await apiClient.put("/users/me", {
        firstName: editFirstName,
        lastName: editLastName,
      });
      // Zaktualizuj store żeby UI się odświeżył
      if (token && user) {
        await loginSilent(token, {
          ...user,
          firstName: editFirstName,
          lastName: editLastName,
        });
      }
      setEditVisible(false);
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się zapisać danych");
    }
  };
  const handleDeleteAccount = () => {
    Alert.alert(
      "Usuń konto",
      "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna i usunie wszystkie twoje dane.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            // TODO: wywołanie API usunięcia konta
            await logout();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + email */}
        <Pressable
          style={styles.avatarSection}
          onPress={() => {
            setEditFirstName(user?.firstName ?? "");
            setEditLastName(user?.lastName ?? "");
            setEditVisible(true);
          }}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="rgba(70,90,110,0.5)" />
          </View>
          <Text style={styles.email}>
            {user?.firstName ?? user?.email?.split("@")[0] ?? "—"}
          </Text>
          <Text
            style={{ fontSize: 12, color: "rgba(70,90,110,0.4)", marginTop: 2 }}
          >
            Edytuj profil
          </Text>
        </Pressable>

        {/* Modal edycji */}
        <Modal visible={editVisible} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setEditVisible(false)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.cardTitle}>Edytuj profil</Text>

              <Text style={styles.label}>Imię</Text>
              <TextInput
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholder="Jan"
                placeholderTextColor="rgba(111,122,134,0.55)"
                style={styles.input}
              />

              <Text style={styles.label}>Nazwisko</Text>
              <TextInput
                value={editLastName}
                onChangeText={setEditLastName}
                placeholder="Kowalski"
                placeholderTextColor="rgba(111,122,134,0.55)"
                style={styles.input}
              />

              <Pressable style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Zapisz</Text>
              </Pressable>

              <Pressable onPress={() => setEditVisible(false)}>
                <Text style={styles.cancelText}>Anuluj</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Statystyki */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statystyki</Text>
          <View style={styles.statsRow}>
            <StatBox
              icon="book-outline"
              label="Wpisów"
              value={String(entryCount)}
            />
          </View>
        </View>
        {/* Ustawienia */}
        <NotificationsSettingsCard />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ustawienia</Text>
          {/* Row icon="notifications-outline" usunięty — zastąpiony kartą wyżej */}
          <Row icon="lock-closed-outline" label="Zmień hasło" />
          <Row icon="download-outline" label="Eksport danych" />
          <Pressable onPress={handleDeleteAccount}>
            <Row icon="trash-outline" label="Usuń konto" destructive />
          </Pressable>
        </View>

        {/* Wylogowanie */}
        <Pressable style={styles.logoutButton} onPress={() => logout()}>
          <Ionicons name="log-out-outline" size={20} color="#c0504d" />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  value,
  destructive,
}: {
  icon: any;
  label: string;
  value?: string;
  destructive?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={18}
        color={destructive ? "#c0504d" : "rgba(70,90,110,0.6)"}
      />
      <Text style={[styles.rowLabel, destructive && { color: "#c0504d" }]}>
        {label}
      </Text>
      {value !== undefined && <Text style={styles.rowValue}>{value}</Text>}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={destructive ? "rgba(192,80,77,0.35)" : "rgba(70,90,110,0.35)"}
        style={{ marginLeft: "auto" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "rgba(111,122,134,0.78)",
    marginTop: 8,
  },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(240,244,248,0.9)",
    borderWidth: 1,
    borderColor: "rgba(170,190,210,0.38)",
    color: "rgba(70,80,90,0.95)",
  },
  saveButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#b6cce9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#355A7A",
  },
  cancelText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    color: "rgba(111,122,134,0.6)",
  },
  safe: { flex: 1, backgroundColor: "#f0f4f8" },

  topBar: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  scroll: { padding: 16, gap: 14, paddingBottom: 110 },

  avatarSection: { alignItems: "center", marginVertical: 12 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  email: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(70,80,90,0.75)",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.62)",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(111,122,134,0.78)",
    marginBottom: 4,
  },

  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800", color: "rgba(70,80,90,0.85)" },
  statLabel: { fontSize: 11, fontWeight: "600", color: "rgba(70,80,90,0.5)" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "rgba(70,80,90,0.75)" },
  rowValue: {
    fontSize: 13,
    color: "rgba(70,80,90,0.45)",
    marginLeft: "auto",
    marginRight: 4,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.62)",
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#c0504d" },
});
