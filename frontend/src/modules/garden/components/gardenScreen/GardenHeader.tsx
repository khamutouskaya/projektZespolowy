import { Image, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "@/services/store/useAuthStore";

type Props = {
  fruitsBalance: number;
  onRefresh: () => void;
};

const FRUIT_IMAGE = require("../../../../../assets/images/fruit.png");
const COIN_IMAGE = require("../../../../../assets/shop/coin.png");

export default function GardenHeader({ fruitsBalance, onRefresh }: Props) {
  const coinsBalance = useAuthStore((s) => s.user?.coinsBalance ?? 0);

  return (
    <View style={styles.container}>
      {/* Owoce */}
      <View style={styles.fruitBadge}>
        <Image source={FRUIT_IMAGE} style={styles.fruitIcon} resizeMode="contain" />
        <Text style={styles.fruitText}>{fruitsBalance}</Text>
      </View>

      {/* Monety — styl identyczny jak ShopBalance */}
      <View style={styles.coinWrapper}>
        <Image source={COIN_IMAGE} style={styles.coin} resizeMode="contain" fadeDuration={0} />
        <Text style={styles.coinValue}>{coinsBalance}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 55,
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  fruitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  fruitIcon: {
    width: 22,
    height: 22,
  },
  fruitText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff4dc",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coinWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  coin: {
    width: 22,
    height: 22,
  },
  coinValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff4dc",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
