import { View, StyleSheet } from "react-native";

export default function PlannerEmptyState() {
  return <View style={styles.space} />;
}

const styles = StyleSheet.create({
  space: {
    flex: 1,
  },
});