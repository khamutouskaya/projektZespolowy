import React from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { ACCENT_LIGHT, GOLD } from "../profile.constants";
import { PREMIUM_FEATURES } from "../data/premiumFeatures";
import { FeatureRow } from "./FeatureRow";

interface SubscriptionCardProps {
  isPremium: boolean;
  featuresExpanded: boolean;
  onToggleExpanded: () => void;
  onOpenModal: () => void;
  onCancelPremium: () => Promise<void>;
}

export function SubscriptionCard({
  isPremium,
  featuresExpanded,
  onToggleExpanded,
  onOpenModal,
  onCancelPremium,
}: SubscriptionCardProps) {
  const handleCancelConfirm = () => {
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
              await onCancelPremium();
            } catch (e: any) {
              Alert.alert(
                "Błąd",
                e?.response?.data?.message ?? e?.message ?? "Nie udało się odwołać subskrypcji",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.card, isPremium && styles.cardPremium]}>
      <TouchableOpacity
        activeOpacity={isPremium ? 0.75 : 1}
        onPress={isPremium ? onToggleExpanded : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.starBg}>
              <Ionicons name="star" size={14} color={isPremium ? GOLD : colors.text.primary} />
            </View>
            <Text style={[styles.title, isPremium && styles.titleGold]}>
              {isPremium ? "Plan Premium" : "Odkryj Premium"}
            </Text>
          </View>
          {isPremium ? (
            <View style={styles.headerRight}>
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
            <Text style={styles.price}>od 29 zł/mies.</Text>
          )}
        </View>
      </TouchableOpacity>

      {!isPremium && (
        <>
          <Text style={styles.intro}>
            Odblokuj pełen potencjał aplikacji — pracuj z psychologiem i korzystaj z zaawansowanych analiz AI.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn} onPress={onOpenModal} activeOpacity={0.82}>
            <LinearGradient
              colors={["#b6b9ee", "#838bf5", "#6670ff"]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={styles.upgradeBtnGradient}
            >
              <View style={styles.upgradeBtnShine} />
              <Ionicons name="star" size={16} color={GOLD} />
              <Text style={styles.upgradeBtnText}>Ulepsz do Premium</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      {isPremium && featuresExpanded && (
        <>
          <View style={styles.featureList}>
            {PREMIUM_FEATURES.map((f, i) => (
              <FeatureRow key={i} icon={f.icon} label={f.label} unlocked first={i === 0} />
            ))}
          </View>
          <View style={styles.thanks}>
            <Ionicons name="heart" size={13} color={GOLD} />
            <Text style={styles.thanksText}>Dziękujemy za zaufanie!</Text>
          </View>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.75} onPress={handleCancelConfirm}>
            <Text style={styles.cancelBtnText}>Anuluj subskrypcję</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ACCENT_LIGHT,
  },
  cardPremium: {
    borderColor: "rgba(200,156,0,0.28)",
    backgroundColor: "rgba(255,252,240,0.7)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  starBg: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center", justifyContent: "center",
  },
  title: { ...typography.small, fontWeight: "700" as const, color: colors.text.primary },
  titleGold: { color: "#6B4E00" },
  activeBadge: {
    backgroundColor: "rgba(76,175,130,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeBadgeText: { fontSize: 11, fontWeight: "700" as const, color: "#2e7d53" },
  price: { ...typography.caption, fontWeight: "600" as const, color: colors.text.secondary },
  intro: { ...typography.caption, color: colors.text.secondary, lineHeight: 19, marginBottom: 14 },
  featureList: { gap: 2 },
  thanks: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.s, marginTop: 14, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: "rgba(200,156,0,0.2)",
  },
  thanksText: { ...typography.caption, fontWeight: "600" as const, color: "#8a6800" },
  cancelBtn: {
    alignSelf: "center", marginTop: 12,
    paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 999, borderWidth: 1.5,
    borderColor: "#c0504d", backgroundColor: "rgba(192,80,77,0.08)",
  },
  cancelBtnText: { ...typography.caption, color: "#c0504d", fontWeight: "600" as const },
  upgradeBtn: {
    marginTop: spacing.md, borderRadius: 18,
    shadowColor: colors.shadow.primary, shadowOpacity: 0.3,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 14, borderWidth: 1.5,
    borderColor: "rgba(171,184,245,0.75)", overflow: "hidden",
  },
  upgradeBtnGradient: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.sm, paddingVertical: 17, paddingHorizontal: 22,
  },
  upgradeBtnShine: {
    position: "absolute", top: 0, left: "5%", right: "5%", height: "46%",
    backgroundColor: "rgba(255,255,255,0.26)",
    borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
  },
  upgradeBtnText: { ...typography.body, fontWeight: "800" as const, color: "#fff", letterSpacing: 0.5 },
});
