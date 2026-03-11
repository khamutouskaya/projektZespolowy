import { View, TextInput, StyleSheet } from "react-native";

export default function DiarySearch() {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Szukaj w zapisach..."
        placeholderTextColor="#999"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},

  input: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    flex: 1,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,

    backgroundColor: "rgba(255,255,255,0.7)", // 👈 под твой стеклянный стиль
    fontSize: 16,
  },
});
