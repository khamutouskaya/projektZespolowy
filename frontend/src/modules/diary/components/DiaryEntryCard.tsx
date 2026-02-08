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
    backgroundColor: "rgba(255,255,255,0.7)", // kolor tła karty z przezroczystością
    borderRadius: 20, // zaokrąglenie rogów karty
    padding: 16, // odstęp wewnętrzny od krawędzi
    marginBottom: 12, // odstęp pod kartą
  },

  header: {
    flexDirection: "row", // ułożenie elementów w poziomie
    justifyContent: "flex-start", // maksymalny odstęp między elementami
    alignItems: "center", // wyrównanie elementów w pionie
    gap: 8,
  },

  icon: {
    fontSize: 26, // rozmiar ikony / emoji
    marginBottom: 6, // odstęp pod ikoną
  },

  title: {
    fontSize: 18, // rozmiar tekstu tytułu
    color: "#2e65a4", // kolor tytułu
    marginBottom: 10, // odstęp pod tytułem
  },

  preview: {
    fontSize: 14, // rozmiar tekstu podglądu
    color: "#333", // kolor tekstu
    marginBottom: 10, // odstęp pod tekstem
  },

  footer: {
    flexDirection: "row", // elementy w jednym rzędzie
    justifyContent: "space-between", // rozłożenie elementów na szerokość
    alignItems: "center", // wyrównanie w pionie
  },

  meta: {
    fontSize: 12, // mały rozmiar tekstu
    color: "#6b7280", // kolor tekstu pomocniczego
  },

  moodLabel: {
    fontSize: 12, // rozmiar etykiety nastroju
    fontWeight: "600", // pogrubienie tekstu
    color: "#4da6ff", // kolor etykiety nastroju
  },
});
