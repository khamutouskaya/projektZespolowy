import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function AccessoriesScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.card}>
          <Text style={styles.title}>Akcesoria</Text>
          <Text style={styles.text}>
            Tutaj będą dodatki i akcesoria dla twojej chmurki ✨
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#6F7A86",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#7B8794",
    textAlign: "center",
    lineHeight: 24,
  },
});