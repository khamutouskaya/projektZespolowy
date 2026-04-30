import { StyleSheet, Text, View } from "react-native";

export default function GardenHeader() {
  return (
    <View style={styles.sign}>
      <Text style={styles.text}></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sign: {
    position: "absolute",
    top: 190,
    alignSelf: "center",
    width: 260,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff4dc",
    textShadowColor: "#5a3a1c",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
});