import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  fruitsBalance: number;
};

const FRUIT_IMAGE = require("../../../../../assets/images/fruit.png");

export default function GardenHeader({ fruitsBalance }: Props) {
  return (
    <View style={styles.sign}>
      <View style={styles.row}>
        <Image source={FRUIT_IMAGE} style={styles.icon} resizeMode="contain" />
        <Text style={styles.text}>{fruitsBalance}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sign: {
    position: "absolute",
    top: 55,
    alignSelf: "center",
    width: 260,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    width: 28,
    height: 28,
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