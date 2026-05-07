import { colors } from "@/shared/theme/colors";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function AssistantTypingIndicator() {
  return (
    <View style={styles.row}>
      <ActivityIndicator size="small" color={colors.text.primary} />
      <Text style={styles.text}>Asystent pisze...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingRight: 28,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#567C8D",
  },
});
