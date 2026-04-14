import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  onClear: () => void;
};

export default function PlannerDateChip({ label, onClear }: Props) {
  return (
    <View style={styles.chip}>
      <Ionicons name="calendar-outline" size={18} color="white" />
      <Text style={styles.text}>{label}</Text>

      <Pressable onPress={onClear} style={styles.clearButton}>
        <Ionicons name="close" size={18} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#6F7A86",
    borderRadius: 999,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
  },
  text: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    marginLeft: 2,
  },
});