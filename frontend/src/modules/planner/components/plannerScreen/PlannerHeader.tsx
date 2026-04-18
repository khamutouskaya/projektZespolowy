import { View, Text, StyleSheet, Pressable } from "react-native";
import { typography } from "@/shared/theme/typography";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

type Props = {
  title: string;
  dateText: string;
  showDone?: boolean;
  onDone?: () => void;
};

export default function PlannerHeader({
  title,
  dateText,
  showDone = false,
  onDone,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>

        {showDone && (
          <Pressable onPress={onDone} style={styles.doneBtn}>
            <Text style={styles.done}>Gotowe</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.date}>{dateText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text.primary,
  },
  doneBtn: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  done: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  date: {
    marginTop: spacing.xs,
    ...typography.title,
    color: colors.text.secondary,
  },
});
