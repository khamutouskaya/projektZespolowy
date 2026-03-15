import { View, Text, StyleSheet, Pressable } from "react-native";
import { typography } from "@/shared/theme/typography";
import { colors } from "@/shared/theme/colors";

type Props = {
  date: string;
  onBack: () => void;
  onTest: () => void;
};

export default function DiaryNoteHeader({ date, onBack, onTest }: Props) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Wszystkie</Text>
      </Pressable>

      <Text style={styles.date}>{date}</Text>

      <Pressable style={styles.testButton} onPress={onTest}>
        <Text style={styles.testText}>Zrób test</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.5,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  back: {
    ...typography.small,
    color: colors.text.primary,
  },

  date: {
    ...typography.small,
    color: colors.text.primary,
  },

  testButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.background.glass,
  },

  testText: {
    ...typography.small,
    color: colors.text.primary,
  },
});
