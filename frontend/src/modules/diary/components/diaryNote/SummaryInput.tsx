import { View, Text, StyleSheet } from "react-native";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

type Props = {
  summary?: string;
};

export default function DiarySummary({ summary }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>
        {summary || "Podsumowanie będzie gotowe o 22:00"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.card,
    minHeight: 170,
  },

  text: {
    ...typography.input,
    color: colors.text.tertiary,
    lineHeight: 22,
  },
});
