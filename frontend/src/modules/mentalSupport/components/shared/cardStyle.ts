import { StyleSheet } from "react-native";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

export const cardStyle = StyleSheet.create({
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
