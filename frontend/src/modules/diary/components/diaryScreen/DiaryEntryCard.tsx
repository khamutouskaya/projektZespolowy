import { colors } from "@/shared/theme/colors";
import { cardStyles } from "@/shared/theme/styles";
import { typography } from "@/shared/theme/typography";
import { StyleSheet, Text, View } from "react-native";
import { DiaryEntry } from "../../diary.types";

type Props = {
  entry: DiaryEntry;
};

export default function DiaryEntryCard({ entry }: Props) {
  const tags = entry.tags ? JSON.parse(entry.tags) : [];

  return (
    <View style={cardStyles.card}>
      {/* Icon + data */}
      <View style={styles.header}>
        <Text style={styles.icon}>{entry.icon}</Text>
        <Text style={styles.title}>{entry.date}</Text>
      </View>

      {/* Streszczenie */}
      {entry.preview ? (
        <Text style={styles.preview} numberOfLines={2}>
          {entry.preview}
        </Text>
      ) : null}

      {/* tag */}
      <View style={styles.tagsRow}>
        {tags[0] ? <Text style={styles.tag}>{tags[0]}</Text> : null}
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

  summary: {
    fontSize: 13,
    color: "rgba(70,80,90,0.6)",
    marginBottom: 6,
    fontStyle: "italic",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(173,219,183,0.35)",
    color: "rgba(70,80,90,0.75)",
    fontWeight: "600",
  },
});
