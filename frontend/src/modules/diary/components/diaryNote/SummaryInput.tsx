import { colors } from "@/shared/theme/colors";
import { cardStyles } from "@/shared/theme/styles";
import { typography } from "@/shared/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  summary?: string;
};

export default function DiarySummary({ summary }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.text, !summary && styles.placeholder]}>
        {summary ??
          "Naciśnij „✨ Generuj”, aby AI stworzyło podsumowanie Twojego dnia."}
      </Text>
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
  placeholder: {
    color: colors.text.quaternary,
    fontStyle: "italic",
  },
});
