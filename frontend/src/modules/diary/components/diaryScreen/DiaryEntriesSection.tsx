import { View, Text, StyleSheet } from "react-native";
import { DiaryEntry } from "../../diary.types";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import DiaryEntryCard from "./DiaryEntryCard";

type Props = {
  title: string;
  entries: DiaryEntry[];
  onDeleteEntry: (id: string) => void;
};

export default function DiaryEntriesSection({
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
    marginTop: 24,
  },
  title: {
    ...typography.title,
    color: colors.text.tertiary,
    marginBottom: 12,
  },
  list: {},
});
