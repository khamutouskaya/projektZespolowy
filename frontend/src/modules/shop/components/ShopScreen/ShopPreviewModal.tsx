import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ShopItem } from "../../shop.types";

type Props = {
  item: ShopItem | null;
  visible: boolean;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
  isOwned?: boolean;
  onEquip?: (item: ShopItem) => void;
};

export default function ShopPreviewModal({
  item,
  visible,
  onClose,
  onBuy,
  isOwned,
  onEquip,
}: Props) {
  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Image source={item.preview} style={styles.preview} resizeMode="contain" />

          <Text style={styles.name}>{item.name}</Text>

          {!isOwned && (
            <View style={styles.priceRow}>
              <Image
                source={require("../../../../../assets/shop/coin.png")}
                style={styles.coin}
                resizeMode="contain"
              />
              <Text style={styles.price}>{item.price} monet</Text>
            </View>
          )}

          {isOwned ? (
            <Pressable style={styles.buyButton} onPress={() => onEquip && onEquip(item)}>
              <Text style={styles.buyText}>Załóż</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.buyButton} onPress={() => onBuy(item)}>
              <Text style={styles.buyText}>Kup teraz</Text>
            </Pressable>
          )}

          <Pressable onPress={onClose}>
            <Text style={styles.closeText}>Zamknij</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(24, 28, 40, 0.32)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(230,235,245,0.9)",
  },
  preview: {
    width: 220,
    height: 170,
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#465d84",
    textAlign: "center",
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  coin: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  price: {
    fontSize: 16,
    color: "#7b6740",
    fontWeight: "600",
  },
  buyButton: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#6f83f6",
    marginBottom: 14,
  },
  buyText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  closeText: {
    fontSize: 15,
    color: "#7c8598",
  },
});