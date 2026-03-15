import { View, Text, StyleSheet } from "react-native";
import { typography } from "@/shared/theme/typography";
import { colors } from "@/shared/theme/colors";

export default function DiaryHeader() {
  return (
    <View>
      <Text style={styles.title}>Jak minąl twój dzień?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.heading1,
    color: colors.text.primary, // stonowany kolor tekstu
    textAlign: "center",
    paddingHorizontal: 25,
    //textTransform: "uppercase", // wielkie litery
    //letterSpacing: 0.5, // odstęp między literami
  },
});
