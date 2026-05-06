import { View, Text, StyleSheet, Pressable } from "react-native";
import { typography } from "@/shared/theme/typography";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

type Props = {
  date: string;
  onBack: () => void;
  onSave: () => void;
};

export default function DiaryNoteHeader({ date, onBack, onSave }: Props) {
  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>‹ Dziennik</Text>
      </Pressable>

      <Text style={styles.date}>{date}</Text>

      <Pressable style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveText}>Zapisz</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    marginBottom: 10,
  },

  back: {
    minWidth: 80,
  },

  backText: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text.primary,
  },

  date: {
    ...typography.small,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    flex: 1,
  },

  saveButton: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "flex-end",
  },

  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
