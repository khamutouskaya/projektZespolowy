import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { DIVIDER } from "../profile.constants";

interface StatsRowProps {
  entryCount: number;
  memberSince: string;
}

export function StatsRow({ entryCount, memberSince }: StatsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <Ionicons name="book-outline" size={20} color={colors.text.primary} />
        <Text style={styles.value}>{entryCount}</Text>
        <Text style={styles.label}>Wpisów w dzienniku</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Ionicons name="calendar-outline" size={20} color={colors.text.primary} />
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {memberSince}
        </Text>
        <Text style={styles.label}>Członek od</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    ...cardStyles.card,
    flexDirection: "row",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: spacing.sm,
  },
  item:    { flex: 1, alignItems: "center", gap: spacing.xs },
  divider: { width: 1, backgroundColor: DIVIDER, marginVertical: spacing.xs },
  value: {
    ...typography.small,
    fontWeight: "800" as const,
    color: colors.text.primary,
    textAlign: "center",
  },
  label: {
    ...typography.caption,
    fontWeight: "600" as const,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
