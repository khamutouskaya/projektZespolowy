import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import NotificationsSettingsCard from "../components/profileScreen/NotificationsSettingsCard";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Alert,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../services/store/useAuthStore";
import { useProfileStats } from "../hooks/useProfileStats";
import StatBox from "../components/profileScreen/StatBox";
import { apiClient } from "../../../services/api/client";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const loginSilent = useAuthStore((state) => state.loginSilent);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const { entryCount, memberSince, reload } = useProfileStats();

  const [editVisible, setEditVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName ?? "");
  const [editLastName, setEditLastName] = useState(user?.lastName ?? "");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStep, setPasswordStep] = useState<"email" | "reset">("email");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [contactExpanded, setContactExpanded] = useState(false);
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [editStep, setEditStep] = useState<"main" | "password">("main");

  const closeEditModal = () => {
    setEditVisible(false);
    setEditStep("main");
    setPasswordStep("email");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Brak dostępu", "Zezwól na dostęp do zdjęć w ustawieniach.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        await apiClient.put("/users/me", { avatar: base64 });
        if (token && user)
          await loginSilent(token, { ...user, avatar: base64 });
      } catch {
        Alert.alert("Błąd", "Nie udało się zapisać avatara");
      }
    }
  };

  const handleSaveProfile = async () => {
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

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setIsSending(true);
    try {
      await apiClient.post("/auth/forgot-password", { email: user.email });
      setPasswordStep("reset");
    } catch (e: any) {
      Alert.alert(
        "Błąd",
        e.response?.data?.message ?? "Nie udało się wysłać emaila",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword)
      return Alert.alert("Błąd", "Wypełnij wszystkie pola");
    if (newPassword !== confirmPassword)
      return Alert.alert("Błąd", "Hasła nie są zgodne");
    if (newPassword.length < 6)
      return Alert.alert("Błąd", "Hasło musi mieć co najmniej 6 znaków");
    try {
      await apiClient.post("/auth/reset-password", {
        token: resetToken,
        newPassword,
      });
      Alert.alert("Sukces", "Hasło zostało zmienione");
      setPasswordVisible(false);
      setPasswordStep("email");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      Alert.alert(
        "Błąd",
        e.response?.data?.message ?? "Nieprawidłowy lub wygasły token",
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Usuń konto",
      "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => await logout(),
        },
      ],
    );
  };

  return (
    <ImageBackground
      source={require("../../../../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Avatar + imię */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickAvatar} style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons
                    name="person"
                    size={40}
                    color="rgba(70,90,110,0.5)"
                  />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera-outline" size={14} color="#355A7A" />
              </View>
            </Pressable>

            <TouchableOpacity
              onPress={() => {
                setEditFirstName(user?.firstName ?? "");
                setEditLastName(user?.lastName ?? "");
                setEditVisible(true);
              }}
            >
              <Text style={styles.displayName}>
                {user?.firstName ?? user?.email?.split("@")[0] ?? "—"}
              </Text>
              <Text style={styles.editHint}>Edytuj profil</Text>
            </TouchableOpacity>
          </View>

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

          {/* Subskrypcja */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Subskrypcja</Text>
            <View style={styles.subscriptionRow}>
              <View
                style={[
                  styles.planBadge,
                  user?.isPremium && styles.planBadgePremium,
                ]}
              >
                <Text
                  style={[
                    styles.planBadgeText,
                    user?.isPremium && styles.planBadgeTextPremium,
                  ]}
                >
                  {user?.isPremium ? "✦ Premium" : "Darmowy"}
                </Text>
              </View>
              {!user?.isPremium && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() =>
                    Alert.alert(
                      "Premium — wkrótce",
                      "Płatne plany będą dostępne w kolejnej wersji aplikacji.",
                      [{ text: "OK" }],
                    )
                  }
                >
                  <Text style={styles.upgradeText}>Ulepsz ↗</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Krótki opis planu */}
            {user?.isPremium ? (
              <Text style={styles.planDescription}>
                Masz dostęp do wszystkich funkcji aplikacji. Dziękujemy za
                wsparcie!
              </Text>
            ) : (
              <Text style={styles.planDescription}>
                Plan darmowy obejmuje podstawowe funkcje dziennika i asystenta.
                Premium odblokuje zaawansowane analizy i nieograniczony dostęp
                do AI.
              </Text>
            )}
          </View>

          {/* Ustawienia */}
          <NotificationsSettingsCard />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ustawienia</Text>
            <TouchableOpacity onPress={handleDeleteAccount}>
              <Row icon="trash-outline" label="Usuń konto" destructive />
            </TouchableOpacity>
          </View>

          {/* Kontakt */}
          <Pressable
            style={styles.card}
            onPress={() => setContactExpanded((v) => !v)}
          >
            <View style={styles.expandRow}>
              <Text style={styles.cardTitle}>Kontakt</Text>
              <Ionicons
                name={contactExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="rgba(111,122,134,0.6)"
              />
            </View>
            {contactExpanded && (
              <View style={styles.row}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="rgba(70,90,110,0.6)"
                />
                <Text style={styles.rowLabel}>support@mentalos.app</Text>
              </View>
            )}
          </Pressable>

          {/* Bezpieczeństwo */}
          <Pressable
            style={styles.card}
            onPress={() => setSecurityExpanded((v) => !v)}
          >
            <View style={styles.expandRow}>
              <Text style={styles.cardTitle}>Bezpieczeństwo</Text>
              <Ionicons
                name={securityExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="rgba(111,122,134,0.6)"
              />
            </View>
            {securityExpanded && (
              <Text style={styles.expandedText}>
                Twoje dane są szyfrowane i przechowywane bezpiecznie. Nigdy nie
                udostępniamy ich osobom trzecim.
              </Text>
            )}
          </Pressable>

          {/* Wylogowanie */}
          <Pressable style={styles.logoutButton} onPress={() => logout()}>
            <Ionicons name="log-out-outline" size={20} color="#c0504d" />
            <Text style={styles.logoutText}>Wyloguj się</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <Modal visible={editVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeEditModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {editStep === "main" && (
              <>
                <Text style={styles.modalTitle}>Edytuj profil</Text>

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

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
                </Pressable>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Zmień hasło jako wiersz */}
                <Pressable
                  style={styles.inlineRow}
                  onPress={() => setEditStep("password")}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="rgba(70,90,110,0.6)"
                  />
                  <Text style={styles.inlineRowLabel}>Zmień hasło</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(70,90,110,0.35)"
                    style={{ marginLeft: "auto" }}
                  />
                </Pressable>

                <Pressable onPress={closeEditModal}>
                  <Text style={styles.cancelText}>Anuluj</Text>
                </Pressable>
              </>
            )}

            {editStep === "password" && passwordStep === "email" && (
              <>
                <Pressable
                  onPress={() => setEditStep("main")}
                  style={styles.backRow}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color="rgba(70,90,110,0.6)"
                  />
                  <Text style={styles.backText}>Wróć</Text>
                </Pressable>

                <Text style={styles.modalTitle}>Zmień hasło</Text>
                <Text style={styles.modalInfo}>
                  Wyślemy link do zmiany hasła na adres:{"\n"}
                  <Text
                    style={{ fontWeight: "700", color: "rgba(70,80,90,0.8)" }}
                  >
                    {user?.email}
                  </Text>
                </Text>

                <Pressable
                  style={[styles.saveButton, { marginTop: 20 }]}
                  onPress={handleSendResetEmail}
                  disabled={isSending}
                >
                  <Text style={styles.saveButtonText}>
                    {isSending ? "Wysyłanie..." : "Wyślij email"}
                  </Text>
                </Pressable>
              </>
            )}

            {editStep === "password" && passwordStep === "reset" && (
              <>
                <Pressable
                  onPress={() => setPasswordStep("email")}
                  style={styles.backRow}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color="rgba(70,90,110,0.6)"
                  />
                  <Text style={styles.backText}>Wróć</Text>
                </Pressable>

                <Text style={styles.modalTitle}>Ustaw nowe hasło</Text>
                <Text style={styles.modalInfo}>
                  Wpisz token z emaila i nowe hasło.
                </Text>

                <Text style={styles.label}>Token z emaila</Text>
                <TextInput
                  value={resetToken}
                  onChangeText={setResetToken}
                  placeholder="Wklej token"
                  placeholderTextColor="rgba(111,122,134,0.55)"
                  style={styles.input}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Nowe hasło</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(111,122,134,0.55)"
                  secureTextEntry
                  style={styles.input}
                />

                <Text style={styles.label}>Potwierdź nowe hasło</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(111,122,134,0.55)"
                  secureTextEntry
                  style={styles.input}
                />

                <Pressable
                  style={styles.saveButton}
                  onPress={handleResetPassword}
                >
                  <Text style={styles.saveButtonText}>Zmień hasło</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ImageBackground>
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
  background: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 14, paddingBottom: 110 },

  avatarSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  avatarWrapper: { position: "relative", marginBottom: 10 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 84, height: 84, borderRadius: 42 },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: {
    fontSize: 17,
    fontWeight: "700",
    color: "rgba(70,80,90,0.85)",
  },
  editHint: { fontSize: 12, color: "rgba(70,90,110,0.4)", marginTop: 2 },

  card: {
    backgroundColor: "rgba(255,255,255,0.52)",
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

  subscriptionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(182,204,233,0.5)",
  },
  planBadgeText: { fontSize: 13, fontWeight: "700", color: "#355A7A" },
  upgradeButton: {
    marginLeft: "auto",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#b6cce9",
  },
  upgradeText: { fontSize: 13, fontWeight: "700", color: "#355A7A" },

  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expandedText: {
    fontSize: 13,
    color: "rgba(70,80,90,0.6)",
    lineHeight: 20,
  },

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
  divider: {
    height: 0.5,
    backgroundColor: "rgba(170,190,210,0.4)",
    marginVertical: 8,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  inlineRowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(70,80,90,0.75)",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: "rgba(70,90,110,0.6)",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.52)",
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#c0504d" },

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
  modalTitle: { fontSize: 16, fontWeight: "700", color: "rgba(70,80,90,0.85)" },
  modalInfo: {
    fontSize: 13,
    color: "rgba(70,80,90,0.6)",
    lineHeight: 20,
    marginTop: 4,
  },
  label: { fontSize: 13, color: "rgba(111,122,134,0.78)", marginTop: 8 },
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
  saveButtonText: { fontSize: 15, fontWeight: "700", color: "#355A7A" },
  cancelText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    color: "rgba(111,122,134,0.6)",
  },
  planBadgePremium: {
    backgroundColor: "rgba(255,215,100,0.3)",
  },
  planBadgeTextPremium: {
    color: "#7A5A00",
  },
  planDescription: {
    fontSize: 12,
    color: "rgba(70,80,90,0.55)",
    lineHeight: 18,
  },
});
