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
    paddingHorizontal: 16,
    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.7)", // 👈 под твой стеклянный стиль
    fontSize: 16,
  },
});
