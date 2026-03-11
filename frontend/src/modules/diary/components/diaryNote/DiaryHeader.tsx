import { View, Text, StyleSheet, Pressable } from "react-native";

export default function DiaryHeader() {
  return (
    <View style={styles.header}>
      <Pressable>
        <Text style={styles.back}>← Wszystkie</Text>
      </Pressable>

      <Text style={styles.date}>25.12.2025</Text>

      <Pressable style={styles.testButton}>
        <Text style={styles.testText}>Zrób test</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  back: {
    fontSize: 14,
    color: "#375a85",
    fontWeight: "500",
  },

  date: {
    fontSize: 13,
    color: "#6b7280",
  },

  testButton: {
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  testText: {
    fontSize: 12,
    color: "#375a85",
    fontWeight: "500",
  },
});
