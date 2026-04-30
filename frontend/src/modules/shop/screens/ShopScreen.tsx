import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { useState } from "react";
import ShopAvatar from "../components/ShopScreen/ShopAvatar";
import ShopBalance from "../components/ShopScreen/ShopBalance";
import ShopPreviewModal from "../components/ShopScreen/ShopPreviewModal";
import ShopSection from "../components/ShopScreen/ShopSection";
import { shopSectionsMock } from "../data/shop.mock";
import { ShopItem } from "../shop.types";

export default function ShopScreen() {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const handleOpenPreview = (item: ShopItem) => {
    setSelectedItem(item);
    setIsPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setIsPreviewVisible(false);
    setSelectedItem(null);
  };

  const handleBuy = (item: ShopItem) => {
    console.log("BUY ITEM:", item);
    handleClosePreview();
  };

  return (
    <ImageBackground
      source={require("../../../../assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ShopBalance balance={240} />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ShopAvatar />

          {shopSectionsMock.map((section) => (
            <ShopSection
              key={section.id}
              section={section}
              onItemPress={handleOpenPreview}
            />
          ))}
        </View>
      </ScrollView>

      <ShopPreviewModal
        item={selectedItem}
        visible={isPreviewVisible}
        onClose={handleClosePreview}
        onBuy={handleBuy}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 36,
    paddingBottom: 48,
  },
  content: {
    paddingHorizontal: 18,
  },
});