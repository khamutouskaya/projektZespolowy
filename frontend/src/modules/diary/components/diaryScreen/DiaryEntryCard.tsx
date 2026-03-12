import { View, Text, StyleSheet } from "react-native";
import { DiaryEntry } from "../../diary.types";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { cardStyles } from "@/shared/theme/styles";

type Props = {
  entry: DiaryEntry;
};

export default function DiaryEntryCard({ entry }: Props) {
  return (
    <View style={cardStyles.card}>
      {/* Icon + title */}
      <View style={styles.header}>
        <Text style={styles.icon}>{entry.icon}</Text>

        <Text style={styles.title}>{entry.title}</Text>
      </View>

      {/* Preview (2 lines) */}
      <Text style={styles.preview} numberOfLines={2}>
        {entry.preview}
      </Text>

      {/* Time + mood */}
      <View style={styles.footer}>
        <Text style={styles.meta}>
          {entry.date} ~ {entry.duration}
        </Text>

        <Text style={styles.moodLabel}>{entry.mood}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  icon: {
    fontSize: 26,
  },

  title: {
    ...typography.title,
    color: colors.text.primary,
  },

  preview: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 10,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
  },

  meta: {
    flex: 1,
    ...typography.caption,
    color: colors.text.tertiary,
  },

  moodLabel: {
    ...typography.caption,
    color: colors.text.primary,
    marginLeft: 12,
  },
});
