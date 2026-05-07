import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ShopItem } from "../../shop.types";

type Props = {
  item: ShopItem;
  onPress: (item: ShopItem) => void;
};

export default function ShopColorCard({ item, onPress }: Props) {
  return (
    <Pressable style={styles.wrapper} onPress={() => onPress(item)}>
      <Image source={item.thumbnail} style={styles.colorBox} resizeMode="cover" />
      <Text style={styles.label} numberOfLines={1}>
        {item.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "31%",
    alignItems: "center",
  },
  colorBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "rgba(70,93,132,0.25)",
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: "#5e6778",
    textAlign: "center",
  },
});