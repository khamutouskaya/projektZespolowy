import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { ACCENT_LIGHT } from "../profile.constants";

interface CardRowProps {
  icon: string;
  label: string;
  value?: string;
  destructive?: boolean;
  chevron?: boolean;
}

export function CardRow({ icon, label, value, destructive, chevron }: CardRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, destructive && styles.iconDestructive]}>
        <Ionicons
          name={icon as any}
          size={16}
          color={destructive ? "#c0504d" : colors.text.primary}
        />
      </View>
      <Text style={[styles.label, destructive && styles.labelDestructive]}>
        {label}
      </Text>
      {value !== undefined && (
        <Text style={styles.value} numberOfLines={1}>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 9,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDestructive: { backgroundColor: "rgba(192,80,77,0.1)" },
  label: {
    ...typography.body,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  labelDestructive: { color: "#c0504d" },
  value: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: "auto",
    maxWidth: "50%",
    textAlign: "right",
  },
});
