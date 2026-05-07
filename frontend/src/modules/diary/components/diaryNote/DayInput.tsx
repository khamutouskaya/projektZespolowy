import React from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

type Props = {
  text?: string;
  onPress: () => void;
};

export default function DiaryInput({ text, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.text}>{text ?? "Napisz o swoim dniu..."}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.card,
    minHeight: 180,
    padding: 16,
  },

  text: {
    ...typography.small,
    color: colors.text.tertiary,
    lineHeight: 22,
  },
});
