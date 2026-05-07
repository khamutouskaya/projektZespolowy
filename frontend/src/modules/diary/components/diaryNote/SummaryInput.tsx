import { colors } from "@/shared/theme/colors";
import { cardStyles } from "@/shared/theme/styles";
import { typography } from "@/shared/theme/typography";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  summary?: string;
  onChangeSummary?: (text: string) => void; // opcjonalny prop do edycji
};

export default function DiarySummary({ summary, onChangeSummary }: Props) {
  return (
    <View style={styles.card}>
      {onChangeSummary ? ( // jeśli przekazano onChangeSummary — pokaż input
        <TextInput
          value={summary}
          onChangeText={onChangeSummary}
          placeholder="Jak podsumowałbyś dzisiaj swój dzień?"
          placeholderTextColor={colors.text.secondary}
          multiline
          scrollEnabled={false}
          style={styles.text}
        />
      ) : (
        <Text style={styles.text}>
          {summary || "Podsumowanie będzie gotowe o 22:00"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.card,
    minHeight: 180,
  },

  text: {
    ...typography.small,
    color: colors.text.tertiary,
    lineHeight: 22,
  },
});
