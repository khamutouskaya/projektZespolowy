import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
};

export default function PlannerAddBar({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <Ionicons name="add" size={34} color="rgba(111,122,134,0.82)" />
        <Text style={styles.text}>Dodaj zadanie</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 88,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 26,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.95,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(111,122,134,0.88)",
  },
});