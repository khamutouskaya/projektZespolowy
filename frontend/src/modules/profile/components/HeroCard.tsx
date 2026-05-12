import React from "react";
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { UserPayload } from "@/types/auth.types";
import { ACCENT_LIGHT, GOLD } from "../profile.constants";

interface HeroCardProps {
  user: UserPayload | null;
  displayName: string;
  isPremium: boolean;
  onPickAvatar: () => void;
  onOpenEdit: () => void;
}

export function HeroCard({ user, displayName, isPremium, onPickAvatar, onOpenEdit }: HeroCardProps) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPickAvatar} style={styles.avatarWrap}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {(user?.firstName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.cameraBtn}>
          <Ionicons name="camera" size={11} color="#fff" />
        </View>
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.email} numberOfLines={1}>{user?.email ?? ""}</Text>
        <View style={styles.planBadge}>
          <Ionicons
            name={isPremium ? "star" : "person-outline"}
            size={10}
            color={isPremium ? GOLD : colors.text.primary}
          />
          <Text style={[styles.planBadgeText, isPremium && styles.planBadgeTextPremium]}>
            {isPremium ? "Premium" : "Plan darmowy"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={onOpenEdit}>
        <Ionicons name="create-outline" size={18} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  info: { flex: 1, gap: 4 },
  name: { ...typography.title, fontWeight: "800" as const, color: colors.text.primary },
  email: { ...typography.caption, color: colors.text.secondary },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 2,
  },
  planBadgeText: { fontSize: 11, fontWeight: "700" as const, color: colors.text.primary },
  planBadgeTextPremium: { color: "#7A5A00" },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});
