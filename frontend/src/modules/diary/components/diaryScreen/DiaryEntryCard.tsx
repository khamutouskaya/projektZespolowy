import { View, Text, StyleSheet, Pressable } from "react-native";
import { DiaryEntry } from "../../diary.types";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { cardStyles } from "@/shared/theme/styles";

type Props = {
  entry: DiaryEntry;
};
const TAG_MAP: Record<string, string> = {
  Spokój: "💙",
  Relaks: "🌿",
  Energia: "⭐",
  Produktywność: "🚀",
  Radość: "🌞",
  Zmęczenie: "😴",
}; //NOTE: jesli jest to zmieniane, to nalezy tez to uwzglednic w TagSelector (w diaryNote)

import { useRouter } from "expo-router";

export default function DiaryEntryCard({ entry }: Props) {
  const tags = entry.tags ? JSON.parse(entry.tags) : [];
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/diary/note?id=${entry.id}`)}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={cardStyles.card}>
        <View style={styles.header}>
          <Text style={styles.icon}>{entry.icon}</Text>

          <Text style={styles.title}>{entry.title || entry.date}</Text>
        </View>

        {entry.preview ? (
          <Text style={styles.preview} numberOfLines={2}>
            {entry.preview}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.meta}>
            {entry.date} {entry.duration ? `~ ${entry.duration}` : ""}
          </Text>

          {(() => {
            const parsed: string[] = JSON.parse(entry.tags || "[]");
            if (!parsed.length) return null;
            return (
              <View style={styles.tagsRow}>
                {parsed.map((label) => (
                  <Text key={label} style={styles.tag}>
                    {TAG_MAP[label] ?? ""} {label}
                  </Text>
                ))}
              </View>
            );
          })()}
        </View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(70,80,90,0.75)",
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

  tagLabel: {
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
