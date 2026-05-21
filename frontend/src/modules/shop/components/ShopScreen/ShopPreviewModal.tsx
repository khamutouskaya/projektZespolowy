import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShopItem } from "../../shop.types";

type Props = {
  item: ShopItem | null;
  visible: boolean;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
  isOwned?: boolean;
  isEquipped?: boolean;
  onEquip?: (item: ShopItem) => void;
  onUnequip?: (item: ShopItem) => void;
  isBuying?: boolean;
  insufficientFunds?: boolean;
};

export default function ShopPreviewModal({
  item,
  visible,
  onClose,
  onBuy,
  isOwned,
  isEquipped,
  onEquip,
  onUnequip,
  isBuying = false,
  insufficientFunds = false,
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

          {insufficientFunds && (
            <View style={styles.insufficientBanner}>
              <Ionicons name="wallet-outline" size={16} color="#c0504d" />
              <Text style={styles.insufficientText}>
                Masz za mało monet, by kupić ten przedmiot
              </Text>
            </View>
          )}

          {isOwned ? (
            isEquipped ? (
              <Pressable
                style={[styles.buyButton, styles.unequipButton, isBuying && styles.buyButtonDisabled]}
                onPress={() => !isBuying && onUnequip && onUnequip(item)}
                disabled={isBuying}
              >
                {isBuying
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.buyText}>Zdejmij</Text>
                }
              </Pressable>
            ) : (
              <Pressable
                style={[styles.buyButton, isBuying && styles.buyButtonDisabled]}
                onPress={() => !isBuying && onEquip && onEquip(item)}
                disabled={isBuying}
              >
                {isBuying
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.buyText}>Załóż</Text>
                }
              </Pressable>
            )
          ) : (
            <Pressable
              style={[
                styles.buyButton,
                (isBuying || insufficientFunds) && styles.buyButtonDisabled,
              ]}
              onPress={() => !isBuying && !insufficientFunds && onBuy(item)}
              disabled={isBuying || insufficientFunds}
            >
              {isBuying
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.buyText}>Kup teraz</Text>
              }
            </Pressable>
          )}

          <Pressable onPress={!isBuying ? onClose : undefined} disabled={isBuying}>
            <Text style={[styles.closeText, isBuying && { opacity: 0.4 }]}>Zamknij</Text>
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
  buyButtonDisabled: {
    opacity: 0.7,
  },
  unequipButton: {
    backgroundColor: "#8f99b3",
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
  insufficientBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(192,80,77,0.09)",
    borderWidth: 1,
    borderColor: "rgba(192,80,77,0.22)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    width: "100%",
  },
  insufficientText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#c0504d",
  },
});