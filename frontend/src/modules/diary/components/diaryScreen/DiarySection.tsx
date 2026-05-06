import { View, Text, StyleSheet } from "react-native";
import DiaryEntryCard from "./DiaryEntryCard";
import { DiaryEntry } from "../../diary.types";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

type Props = {
  title: string;
  entries: DiaryEntry[];
  onDeleteEntry: (id: string) => void;
};

//group od cards
export default function DiarySection({
  title,
  entries,
  onDeleteEntry,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}:</Text>

      <View style={styles.list}>
        {entries.map((entry, index) => (
          <DiaryEntryCard
            key={entry.id}
            entry={entry}
            onDelete={onDeleteEntry}
            isLast={index === entries.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24, // odstęp od góry – oddziela sekcję od poprzedniej
  },

  title: {
    ...typography.title,
    color: colors.text.tertiary, // stonowany kolor tekstu
    marginBottom: 12, // odstęp pod nagłówkiem
    //  textTransform: "uppercase", // wielkie litery
    //letterSpacing: 0.5, // odstęp między literami
  },

  list: {
    gap: 10, // odstęp między kartami
  },
});
