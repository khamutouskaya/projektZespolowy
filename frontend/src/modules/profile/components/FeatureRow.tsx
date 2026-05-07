import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { ACCENT_LIGHT, GOLD, GOLD_LIGHT } from "../profile.constants";

interface FeatureRowProps {
  icon: string;
  label: string;
  unlocked: boolean;
  highlight?: boolean;
  first?: boolean;
}

export function FeatureRow({ icon, label, unlocked, highlight, first }: FeatureRowProps) {
  return (
    <View style={[styles.row, highlight && styles.rowHighlight, first && { marginTop: 2 }]}>
      <View style={[
        styles.iconWrap,
        highlight && styles.iconWrapHighlight,
        !unlocked && !highlight && styles.iconWrapLocked,
      ]}>
        <Ionicons
          name={icon as any}
          size={15}
          color={
            highlight
              ? unlocked ? GOLD : colors.text.primary
              : unlocked ? colors.text.primary : colors.text.secondary
          }
        />
      </View>
      <Text style={[styles.label, highlight && styles.labelHighlight, !unlocked && styles.labelLocked]}>
        {label}
      </Text>
      <View style={{ marginLeft: "auto" }}>
        {unlocked
          ? <Ionicons name="checkmark-circle" size={16} color={highlight ? GOLD : "#4caf82"} />
          : <Ionicons name="lock-closed" size={13} color={colors.text.secondary} />
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  rowHighlight: {
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapHighlight: { backgroundColor: GOLD_LIGHT },
  iconWrapLocked:    { backgroundColor: ACCENT_LIGHT },
  label: {
    ...typography.caption,
    fontWeight: "600" as const,
    color: colors.text.primary,
    flex: 1,
  },
  labelHighlight: { fontWeight: "700" as const, color: "#5A4000" },
  labelLocked:    { color: colors.text.secondary, fontWeight: "600" as const },
});
