import { StyleSheet, Text, View } from "react-native";
import { ShopItem, ShopSectionData } from "../../shop.types";
import ShopItemCard from "./ShopItemCard";

type Props = {
  section: ShopSectionData;
  onItemPress: (item: ShopItem) => void;
  isOwnedSection?: boolean;
};

export default function ShopSection({ section, onItemPress, isOwnedSection }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{section.title}</Text>

      <View style={styles.grid}>
        {section.items.map((item) => (
          <ShopItemCard key={item.id} item={item} onPress={onItemPress} isOwned={isOwnedSection} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    shadowColor: "#7a8bb8",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#465d84",
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
});