import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ShopItem } from "../../shop.types";

type Props = {
  item: ShopItem;
  onPress: (item: ShopItem) => void;
};

export default function ShopItemCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image
        source={item.thumbnail}
        style={styles.image}
        resizeMode="contain"
        fadeDuration={0}
      />

      <Text style={styles.label} numberOfLines={2}>
        {item.name}
      </Text>

      <View style={styles.priceRow}>
        <Image
          source={require("../../../../../assets/shop/coin.png")}
          style={styles.coin}
          resizeMode="contain"
          fadeDuration={0}
        />
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31%",
    minHeight: 180,
    borderRadius: 24,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#7184b6",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.95,
  },
  image: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    textAlign: "center",
    color: "#5f6e8f",
    fontWeight: "500",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  coin: {
    width: 20,
    height: 16,
    marginRight: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7a6330",
  },
});