import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  balance?: number;
};

export default function ShopBalance({ balance = 240 }: Props) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../../../../../assets/shop/coin.png")}
        style={styles.coin}
        resizeMode="contain"
        fadeDuration={0}
      />

      <Text style={styles.value}>{balance}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 64,
    right: 18,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 13,
    paddingRight: 17,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.5)",
    shadowColor: "#8f99b3",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  coin: {
    width: 30,//bylo 27
    height: 27,
    marginRight: 9,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#78663a",
  },
});