import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.glass, // szklane tło karty
    borderRadius: 20, // zaokrąglenie rogów
    padding: spacing.md, // wewnętrzny odstęp

    shadowColor: colors.shadow.primary, // kolor cienia (iOS)
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    elevation: 6, // cień na Androidzie
  },
});
