import { View, Text, StyleSheet, Pressable } from "react-native";
import { typography } from "@/shared/theme/typography";
import { colors } from "@/shared/theme/colors";

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
          <Pressable onPress={onDone}>
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
    paddingHorizontal: 24,
    marginTop: 22,
    marginBottom: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    ...typography.heading1,
    color: colors.text.primary,
  },

  done: {
    ...typography.heading1,
    color: colors.text.primary,
  },

  date: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(111,122,134,0.82)",
  },
});
