import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];
type ChipTone = "category" | "date" | "reminder" | "note";

type Props = {
  label: string;
  onClear: () => void;
  iconName?: IconName;
  tone?: ChipTone;
};

const chipPalette = {
  category: {
    backgroundColor: "rgba(236, 181, 82, 0.18)",
    borderColor: "rgba(214, 155, 52, 0.34)",
    iconColor: "#B46A08",
    textColor: "#8A5C16",
    clearColor: "#A6640E",
  },
  date: {
    backgroundColor: "rgba(104, 144, 235, 0.16)",
    borderColor: "rgba(88, 126, 212, 0.32)",
    iconColor: "#4168C6",
    textColor: "#32528F",
    clearColor: "#4168C6",
  },
  reminder: {
    backgroundColor: "rgba(89, 181, 149, 0.16)",
    borderColor: "rgba(59, 148, 118, 0.3)",
    iconColor: "#2F8A6B",
    textColor: "#2C6D58",
    clearColor: "#2F8A6B",
  },
  note: {
    backgroundColor: "rgba(125, 137, 160, 0.15)",
    borderColor: "rgba(104, 116, 139, 0.28)",
    iconColor: "#617188",
    textColor: colors.text.secondary,
    clearColor: "#617188",
  },
} satisfies Record<
  ChipTone,
  {
    backgroundColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
    clearColor: string;
  }
>;

export default function PlannerDateChip({
  label,
  onClear,
  iconName = "calendar-outline",
  tone = "date",
}: Props) {
  const palette = chipPalette[tone];

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
      ]}
    >
      <Ionicons name={iconName} size={18} color={palette.iconColor} />
      <Text style={[styles.text, { color: palette.textColor }]}>{label}</Text>

      <Pressable onPress={onClear} style={styles.clearButton}>
        <Ionicons name="close" size={18} color={palette.clearColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    marginLeft: 2,
  },
});
