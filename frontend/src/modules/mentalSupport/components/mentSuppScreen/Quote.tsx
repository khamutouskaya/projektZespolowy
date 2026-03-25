import { View, Text, StyleSheet } from "react-native";
import { typography } from "@/shared/theme/typography";

import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

export default function Quote() {
  const quotes = [
    "Nie jesteś sam. Jesteśmy tu, by cię wspierać.",
    "Każdy dzień to nowa szansa na lepsze jutro.",
    "Twoje uczucia są ważne. Pozwól sobie je odczuwać.",
    "Małe kroki prowadzą do wielkich zmian.",
    "Jesteś silniejszy, niż myślisz.",
    "Nie musisz być doskonały, by być wartościowy.",
    "Twoja historia jest ważna. Podziel się nią, jeśli chcesz.",
    "Każdy ma prawo do wsparcia i zrozumienia.",
    "Nie bój się prosić o pomoc. To oznaka siły, nie słabości.",
    "Twoje emocje są ważne. Znajdź sposób, by je wyrazić.",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <View style={styles.card}>
      <Text style={styles.quote}>{randomQuote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.more,
    borderRadius: 20,
    padding: spacing.md,
    //marginTop: spacing.lg,
    minHeight: 100,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1.5,
    borderColor: "#d0c8da",

    shadowColor: "#827e7e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  quote: {
    ...typography.title,
    color: colors.text.primary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
