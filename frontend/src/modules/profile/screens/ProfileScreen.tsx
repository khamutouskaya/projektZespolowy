import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import NotificationsSettingsCard from "../components/profileScreen/NotificationsSettingsCard";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../services/store/useAuthStore";
import { useProfileStats } from "../hooks/useProfileStats";
import { apiClient } from "../../../services/api/client";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { cardStyles } from "@/shared/theme/styles";

const ACCENT_LIGHT = "rgba(55,90,133,0.11)";
const GOLD = "#ffe100";
const GOLD_LIGHT = "rgba(200,156,0,0.12)";
const DIVIDER = "rgba(150,175,200,0.35)";

const PREMIUM_FEATURES = [
  {
    icon: "person-circle-outline",
    label: "Praca z psychologiem",
    highlight: true,
  },
  { icon: "analytics-outline", label: "Głęboka analiza wzorców" },
  { icon: "flash-outline", label: "Wykrywanie triggerów stresu" },
  { icon: "bar-chart-outline", label: "Analiza nastroju (tydzień / miesiąc)" },
  { icon: "bulb-outline", label: "AI-porady na podstawie zachowania" },
  { icon: "leaf-outline", label: "AI proponuje nawyki" },
  { icon: "trophy-outline", label: "Adaptacyjne cele" },
  { icon: "checkmark-done-outline", label: "Analiza wykonania" },
  { icon: "warning-outline", label: "Prognoza wypalenia" },
] as const;

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const loginSilent = useAuthStore((state) => state.loginSilent);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const buyPremium = useAuthStore((state) => state.buyPremium);
  const cancelPremium = useAuthStore((state) => state.cancelPremium);
  const { entryCount, memberSince, reload } = useProfileStats();

  const [editVisible, setEditVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName ?? "");
  const [editLastName, setEditLastName] = useState(user?.lastName ?? "");
  const [editStep, setEditStep] = useState<"main" | "password">("main");
  const [passwordStep, setPasswordStep] = useState<"email" | "reset">("email");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const [directPasswordEntry, setDirectPasswordEntry] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const closeEditModal = () => {
    setEditVisible(false);
    setTimeout(() => {
      setEditStep("main");
      setPasswordStep("email");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setDirectPasswordEntry(false);
    }, 280);
  };

  const handlePickAvatar = async () => {
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
      closeEditModal();
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
      "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna i usunie wszystkie Twoje dane.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete("/users/me");
            } catch (e: any) {
              Alert.alert(
                "Błąd",
                "Nie udało się usunąć konta. Spróbuj ponownie.",
              );
              return;
            }
            await logout();
          },
        },
      ],
    );
  };

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : (user?.email?.split("@")[0] ?? "—");

  const isPremium = !!user?.isPremium;

  return (
    <ImageBackground
      source={require("../../../../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
      fadeDuration={0}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── HERO ── */}
          <View style={styles.heroCard}>
            <Pressable onPress={handlePickAvatar} style={styles.avatarWrap}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {(
                      user?.firstName?.[0] ??
                      user?.email?.[0] ??
                      "?"
                    ).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.cameraBtn}>
                <Ionicons name="camera" size={11} color="#fff" />
              </View>
            </Pressable>

            <View style={styles.heroInfo}>
              <Text style={styles.heroName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.heroEmail} numberOfLines={1}>
                {user?.email ?? ""}
              </Text>
              <View style={styles.planBadge}>
                <Ionicons
                  name={isPremium ? "star" : "person-outline"}
                  size={10}
                  color={isPremium ? GOLD : colors.text.primary}
                />
                <Text
                  style={[
                    styles.planBadgeText,
                    isPremium && styles.planBadgeTextPremium,
                  ]}
                >
                  {isPremium ? "Premium" : "Plan darmowy"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editIconBtn}
              onPress={() => {
                setEditFirstName(user?.firstName ?? "");
                setEditLastName(user?.lastName ?? "");
                setEditVisible(true);
              }}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* ── STATS ── */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="book-outline"
                size={20}
                color={colors.text.primary}
              />
              <Text style={styles.statValue}>{entryCount}</Text>
              <Text style={styles.statLabel}>Wpisów w dzienniku</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.text.primary}
              />
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {memberSince}
              </Text>
              <Text style={styles.statLabel}>Członek od</Text>
            </View>
          </View>

          {/* ── KONTO ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Konto</Text>
            <CardRow
              icon="mail-outline"
              label="E-mail"
              value={user?.email ?? "—"}
            />
            <View style={styles.cardDivider} />
            <CardRow
              icon="person-outline"
              label="Imię i nazwisko"
              value={displayName}
            />
          </View>

          {/* ── SUBSKRYPCJA ── */}
          <View style={[styles.subCard, isPremium && styles.subCardPremium]}>
            <TouchableOpacity
              activeOpacity={isPremium ? 0.75 : 1}
              onPress={
                isPremium ? () => setFeaturesExpanded((v) => !v) : undefined
              }
            >
              <View style={styles.subHeader}>
                <View style={styles.subHeaderLeft}>
                  <View style={styles.subStarBg}>
                    <Ionicons
                      name="star"
                      size={14}
                      color={isPremium ? GOLD : colors.text.primary}
                    />
                  </View>
                  <Text
                    style={[styles.subTitle, isPremium && styles.subTitleGold]}
                  >
                    {isPremium ? "Plan Premium" : "Odkryj Premium"}
                  </Text>
                </View>
                {isPremium ? (
                  <View style={styles.subHeaderRight}>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Aktywny</Text>
                    </View>
                    <Ionicons
                      name={featuresExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={GOLD}
                    />
                  </View>
                ) : (
                  <Text style={styles.subPrice}>od 29 zł/mies.</Text>
                )}
              </View>
            </TouchableOpacity>

            {!isPremium && (
              <>
                <Text style={styles.subIntro}>
                  Odblokuj pełen potencjał aplikacji — pracuj z psychologiem i
                  korzystaj z zaawansowanych analiz AI.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  onPress={() => setSubModalVisible(true)}
                  activeOpacity={0.82}
                >
                  <LinearGradient
                    colors={["#b6b9ee", "#838bf5", "#6670ff"]}
                    start={{ x: 0.15, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={styles.upgradeBtnGradient}
                  >
                    <View style={styles.upgradeBtnShine} />
                    <Ionicons name="star" size={16} color={GOLD} />
                    <Text style={styles.upgradeBtnText}>Ulepsz do Premium</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="rgba(255,255,255,0.7)"
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {isPremium && featuresExpanded && (
              <>
                <View style={styles.featureList}>
                  {PREMIUM_FEATURES.map((f, i) => (
                    <FeatureRow
                      key={i}
                      icon={f.icon}
                      label={f.label}
                      unlocked
                      first={i === 0}
                    />
                  ))}
                </View>
                <View style={styles.premiumThanks}>
                  <Ionicons name="heart" size={13} color={GOLD} />
                  <Text style={styles.premiumThanksText}>
                    Dziękujemy za zaufanie!
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    Alert.alert(
                      "Odwołaj subskrypcję",
                      "Czy na pewno chcesz anulować plan Premium?",
                      [
                        { text: "Anuluj", style: "cancel" },
                        {
                          text: "Tak, odwołaj",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await cancelPremium();
                            } catch (e: any) {
                              Alert.alert(
                                "Błąd",
                                e?.response?.data?.message ??
                                  e?.message ??
                                  "Nie udało się odwołać subskrypcji",
                              );
                            }
                          },
                        },
                      ],
                    )
                  }
                >
                  <View style={styles.cancelSubBtn}>
                    <Text style={styles.cancelSubText}>Anuluj subskrypcję</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ── POWIADOMIENIA ── */}
          <NotificationsSettingsCard />

          {/* ── USTAWIENIA ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ustawienia</Text>
            <TouchableOpacity
              onPress={() => {
                setEditStep("password");
                setDirectPasswordEntry(true);
                setEditVisible(true);
              }}
            >
              <CardRow icon="lock-closed-outline" label="Zmień hasło" chevron />
            </TouchableOpacity>
            <View style={styles.cardDivider} />
            <TouchableOpacity onPress={handleDeleteAccount}>
              <CardRow
                icon="trash-outline"
                label="Usuń konto"
                destructive
                chevron
              />
            </TouchableOpacity>
          </View>

          {/* ── INFORMACJE ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informacje</Text>
            <CardRow
              icon="mail-outline"
              label="Kontakt"
              value="support@mentalos.app"
            />
            <View style={styles.cardDivider} />
            <CardRow
              icon="shield-checkmark-outline"
              label="Bezpieczeństwo"
              value="Dane szyfrowane"
            />
          </View>

          {/* ── WYLOGOWANIE ── */}
          <Pressable style={styles.logoutBtn} onPress={() => logout()}>
            <Ionicons name="log-out-outline" size={18} color="#c0504d" />
            <Text style={styles.logoutText}>Wyloguj się</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      {/* ── SUBSCRIPTION MODAL ── */}
      <Modal visible={subModalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSubModalVisible(false)}
        >
          <Pressable style={styles.subModalCard} onPress={() => {}}>
            <View style={styles.subModalHeader}>
              <Ionicons name="star" size={16} color={GOLD} />
              <Text style={styles.subModalTitle}>Plan Premium</Text>
              <Pressable
                onPress={() => setSubModalVisible(false)}
                style={styles.subModalClose}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={colors.text.secondary}
                />
              </Pressable>
            </View>

            <Text style={styles.subModalIntro}>
              Wszystko, co dostajesz przechodząc na Premium:
            </Text>

            <ScrollView
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.featureList}>
                {PREMIUM_FEATURES.map((f, i) => (
                  <FeatureRow
                    key={i}
                    icon={f.icon}
                    label={f.label}
                    unlocked={false}
                    first={i === 0}
                  />
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.upgradeBtn, { marginTop: spacing.md }]}
              activeOpacity={0.82}
              disabled={isBuying}
              onPress={async () => {
                setIsBuying(true);
                try {
                  await buyPremium();
                  setSubModalVisible(false);
                } catch (e: any) {
                  const detail =
                    e?.response?.data?.message ?? e?.message ?? "Nieznany błąd";
                  Alert.alert(
                    "Błąd",
                    `Nie udało się aktywować Premium.\n${detail}`,
                  );
                } finally {
                  setIsBuying(false);
                }
              }}
            >
              <LinearGradient
                colors={["#b6b9ee", "#838bf5", "#6670ff"]}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.upgradeBtnGradient}
              >
                <View style={styles.upgradeBtnShine} />
                <Ionicons name="star" size={16} color={GOLD} />
                <Text style={styles.upgradeBtnText}>
                  {isBuying ? "Aktywowanie..." : "Otwórz pełne wsparcie"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color="rgba(255,255,255,0.7)"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal visible={editVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeEditModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {editStep === "main" && (
              <>
                <Text style={styles.modalTitle}>Edytuj profil</Text>

                <Text style={styles.inputLabel}>Imię</Text>
                <TextInput
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  placeholder="Jan"
                  placeholderTextColor={colors.text.quaternary}
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Nazwisko</Text>
                <TextInput
                  value={editLastName}
                  onChangeText={setEditLastName}
                  placeholder="Kowalski"
                  placeholderTextColor={colors.text.quaternary}
                  style={styles.input}
                />

                <Pressable
                  style={styles.primaryBtn}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.primaryBtnText}>Zapisz zmiany</Text>
                </Pressable>

                <View style={styles.modalDivider} />

                <Pressable onPress={closeEditModal}>
                  <Text style={styles.cancelText}>Anuluj</Text>
                </Pressable>
              </>
            )}

            {editStep === "password" && passwordStep === "email" && (
              <>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>Zmień hasło</Text>
                  <Pressable
                    onPress={() =>
                      directPasswordEntry
                        ? closeEditModal()
                        : setEditStep("main")
                    }
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={colors.text.secondary}
                    />
                  </Pressable>
                </View>
                <Text style={styles.modalInfo}>
                  Wyślemy kod na adres:{"\n"}
                  <Text
                    style={{ fontWeight: "700", color: colors.text.primary }}
                  >
                    {user?.email}
                  </Text>
                </Text>

                <Pressable
                  style={[styles.primaryBtn, { marginTop: spacing.lg }]}
                  onPress={handleSendResetEmail}
                  disabled={isSending}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSending ? "Wysyłanie..." : "Wyślij email"}
                  </Text>
                </Pressable>
              </>
            )}

            {editStep === "password" && passwordStep === "reset" && (
              <>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>Nowe hasło</Text>
                  <Pressable
                    onPress={closeEditModal}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={colors.text.secondary}
                    />
                  </Pressable>
                </View>
                <Text style={styles.modalInfo}>
                  Wpisz token z emaila i nowe hasło.
                </Text>

                <Text style={styles.inputLabel}>Token z emaila</Text>
                <TextInput
                  value={resetToken}
                  onChangeText={setResetToken}
                  placeholder="Wklej token"
                  placeholderTextColor={colors.text.quaternary}
                  style={styles.input}
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Nowe hasło</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.quaternary}
                  secureTextEntry
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Potwierdź hasło</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.quaternary}
                  secureTextEntry
                  style={styles.input}
                />

                <Pressable
                  style={styles.primaryBtn}
                  onPress={handleResetPassword}
                >
                  <Text style={styles.primaryBtnText}>Zmień hasło</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ImageBackground>
  );
}

// ─── FeatureRow ───────────────────────────────────────────────────────────────

function FeatureRow({
  icon,
  label,
  unlocked,
  highlight,
  first,
}: {
  icon: any;
  label: string;
  unlocked: boolean;
  highlight?: boolean;
  first?: boolean;
}) {
  return (
    <View
      style={[
        styles.featureRow,
        highlight && styles.featureRowHighlight,
        first && { marginTop: 2 },
      ]}
    >
      <View
        style={[
          styles.featureIconWrap,
          highlight && styles.featureIconWrapHighlight,
          !unlocked && !highlight && styles.featureIconWrapLocked,
        ]}
      >
        <Ionicons
          name={icon}
          size={15}
          color={
            highlight
              ? unlocked
                ? GOLD
                : colors.text.primary
              : unlocked
                ? colors.text.primary
                : colors.text.secondary
          }
        />
      </View>
      <Text
        style={[
          styles.featureLabel,
          highlight && styles.featureLabelHighlight,
          !unlocked && styles.featureLabelLocked,
        ]}
      >
        {label}
      </Text>
      <View style={{ marginLeft: "auto" }}>
        {unlocked ? (
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={highlight ? GOLD : "#4caf82"}
          />
        ) : (
          <Ionicons
            name="lock-closed"
            size={13}
            color={colors.text.secondary}
          />
        )}
      </View>
    </View>
  );
}

// ─── CardRow ─────────────────────────────────────────────────────────────────

function CardRow({
  icon,
  label,
  value,
  destructive,
  chevron,
}: {
  icon: any;
  label: string;
  value?: string;
  destructive?: boolean;
  chevron?: boolean;
}) {
  return (
    <View style={styles.cardRow}>
      <View
        style={[
          styles.cardRowIcon,
          destructive && styles.cardRowIconDestructive,
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={destructive ? "#c0504d" : colors.text.primary}
        />
      </View>
      <Text style={[styles.cardRowLabel, destructive && { color: "#c0504d" }]}>
        {label}
      </Text>
      {value !== undefined && (
        <Text style={styles.cardRowValue} numberOfLines={1}>
          {value}
        </Text>
      )}
      {chevron && (
        <Ionicons
          name="chevron-forward"
          size={15}
          color={destructive ? "rgba(192,80,77,0.4)" : colors.text.quaternary}
          style={{ marginLeft: "auto" }}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 110,
    gap: spacing.sm,
  },

  heroCard: {
    ...cardStyles.card,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.background.glass,
    borderWidth: 2.5,
    borderColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarImage: { width: 63, height: 63, borderRadius: 31.5 },
  avatarPlaceholder: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text.primary,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  heroInfo: { flex: 1, gap: spacing.xs },
  heroName: {
    ...typography.title,
    fontWeight: "800" as const,
    color: colors.text.primary,
  },
  heroEmail: { ...typography.caption, color: colors.text.secondary },

  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 9,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: 2,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  planBadgeTextPremium: { color: "#7A5A00" },

  editIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: {
    ...cardStyles.card,
    flexDirection: "row",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: spacing.sm,
  },
  statItem: { flex: 1, alignItems: "center", gap: spacing.xs },
  statDivider: {
    width: 1,
    backgroundColor: DIVIDER,
    marginVertical: spacing.xs,
  },
  statValue: {
    ...typography.small,
    fontWeight: "800" as const,
    color: colors.text.primary,
    textAlign: "center",
  },
  statLabel: {
    ...typography.caption,
    fontWeight: "600" as const,
    color: colors.text.secondary,
    textAlign: "center",
  },

  subCard: {
    ...cardStyles.card,
    borderRadius: 22,
    padding: 18,
    gap: 0,
    borderWidth: 1,
    borderColor: ACCENT_LIGHT,
  },
  subCardPremium: {
    borderColor: "rgba(200,156,0,0.28)",
    backgroundColor: "rgba(255,252,240,0.7)",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  subHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  subStarBg: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  subTitle: {
    ...typography.small,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  subTitleGold: { color: "#6B4E00" },
  activeBadge: {
    backgroundColor: "rgba(76,175,130,0.15)",
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#2e7d53",
  },
  subPrice: {
    ...typography.caption,
    fontWeight: "600" as const,
    color: colors.text.secondary,
  },

  subIntro: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 19,
    marginBottom: 14,
  },

  featureList: { gap: 2 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  featureRowHighlight: {
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
  },
  featureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconWrapHighlight: { backgroundColor: GOLD_LIGHT },
  featureIconWrapLocked: { backgroundColor: ACCENT_LIGHT },
  featureLabel: {
    ...typography.caption,
    fontWeight: "600" as const,
    color: colors.text.primary,
    flex: 1,
  },
  featureLabelHighlight: { fontWeight: "700" as const, color: "#5A4000" },
  featureLabelLocked: {
    color: colors.text.secondary,
    fontWeight: "600" as const,
  },

  upgradeBtn: {
    marginTop: spacing.md,
    borderRadius: 18,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
    borderWidth: 1.5,
    borderColor: "rgba(171,184,245,0.75)",
    overflow: "hidden",
  },
  upgradeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 17,
    paddingHorizontal: 22,
  },
  upgradeBtnShine: {
    position: "absolute",
    top: 0,
    left: "5%",
    right: "5%",
    height: "46%",
    backgroundColor: "rgba(255,255,255,0.26)",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  upgradeBtnText: {
    ...typography.body,
    fontWeight: "800" as const,
    color: "#fff",
    letterSpacing: 0.5,
  },

  premiumThanks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s,
    marginTop: 14,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(200,156,0,0.2)",
  },
  premiumThanksText: {
    ...typography.caption,
    fontWeight: "600" as const,
    color: "#8a6800",
  },

  card: {
    ...cardStyles.card,
    borderRadius: 20,
    padding: spacing.md,
    gap: 2,
  },
  cardTitle: {
    fontSize: 11.5,
    fontWeight: "700" as const,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 9,
  },
  cardRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardRowIconDestructive: { backgroundColor: "rgba(192,80,77,0.1)" },
  cardRowLabel: {
    ...typography.body,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  cardRowValue: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: "auto",
    maxWidth: "50%",
    textAlign: "right",
  },
  cardDivider: { height: 1, backgroundColor: DIVIDER, marginLeft: 44 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.background.glass,
    borderWidth: 1,
    borderColor: "rgba(192,80,77,0.15)",
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoutText: {
    ...typography.body,
    fontWeight: "700" as const,
    color: "#c0504d",
  },

  subModalCard: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 26,
    padding: 22,
    gap: spacing.s,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  subModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  subModalTitle: { ...typography.title, color: colors.text.primary, flex: 1 },
  subModalClose: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  subModalIntro: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600" as const,
    marginBottom: spacing.s,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.shadow.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 26,
    padding: spacing.xl,
    gap: spacing.s,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.title, color: colors.text.primary },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  modalInfo: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.text.secondary,
    marginTop: spacing.s,
  },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.background.glass,
    borderWidth: 1,
    borderColor: ACCENT_LIGHT,
    ...typography.input,
    color: colors.text.primary,
  },

  primaryBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.s,
    shadowColor: colors.text.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: {
    ...typography.body,
    fontWeight: "700" as const,
    color: "#fff",
  },

  modalDivider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginVertical: spacing.sm,
  },

  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingVertical: spacing.s,
  },
  secondaryRowText: {
    ...typography.titleSmall,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },

  cancelText: {
    textAlign: "center",
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.text.secondary,
  },

  subHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  cancelSubBtn: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#c0504d",
    backgroundColor: "rgba(192,80,77,0.08)",
  },

  cancelSubText: {
    ...typography.caption,
    color: "#c0504d",
    fontWeight: "600" as const,
  },
});
