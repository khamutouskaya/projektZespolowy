import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.glass, // стеклянный фон
    borderRadius: 20, // скругление
    padding: spacing.md, // внутренний отступ

    shadowColor: colors.shadow.primary, // цвет тени
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    elevation: 6, // Android тень
  },
});
