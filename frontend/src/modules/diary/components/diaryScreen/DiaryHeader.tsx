import { View, Text, StyleSheet } from "react-native";

export default function DiaryHeader() {
  return (
    <View>
      <Text style={styles.title}>Jak minąl twój dzień?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20, // rozmiar tekstu nagłówka
    fontWeight: "600", // półpogrubiona czcionka
    color: "#375a85", // stonowany kolor tekstu
    textAlign: "center",
    padding: 5, // odstęp pod nagłówkiem
    paddingHorizontal: 30,
    textTransform: "uppercase", // wielkie litery
    letterSpacing: 0.5, // odstęp między literami
  },
});
