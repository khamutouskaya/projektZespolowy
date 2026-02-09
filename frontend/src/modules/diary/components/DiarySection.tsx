import { View, Text, StyleSheet } from "react-native";
import DiaryEntryCard from "./DiaryEntryCard";
import { DiaryEntry } from "../diary.types";

type Props = {
  title: string;
  entries: DiaryEntry[];
};

//group od cards
export default function DiarySection({ title, entries }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}:</Text>

      <View style={styles.list}>
        {entries.map((entry) => (
          <DiaryEntryCard key={entry.id} entry={entry} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24, // odstęp od góry – oddziela sekcję od poprzedniej
    paddingHorizontal: 16, // odstęp po bokach – żeby treść nie dotykała krawędzi
  },

  title: {
    fontSize: 14, // rozmiar tekstu nagłówka
    fontWeight: "600", // półpogrubiona czcionka
    color: "#6B7A8C", // stonowany kolor tekstu
    marginBottom: 12, // odstęp pod nagłówkiem
    textTransform: "uppercase", // wielkie litery
    letterSpacing: 0.5, // odstęp między literami
  },

  list: {
    gap: 12, // odstęp między kartami
  },
});
