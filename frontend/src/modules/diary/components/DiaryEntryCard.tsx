import { View, Text, StyleSheet } from "react-native";
import { DiaryEntry } from "../diary.types";

type Props = {
  entry: DiaryEntry;
};

export default function DiaryEntryCard({ entry }: Props) {
  return (
    <View style={styles.card}>
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
  card: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 13,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

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
    fontSize: 18,
    color: "#2e65a4",
  },

  preview: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
    shadowColor: "#000",
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
    fontSize: 12,
    color: "#6b7280",
  },

  moodLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4da6ff",
    marginLeft: 12,
  },
});
