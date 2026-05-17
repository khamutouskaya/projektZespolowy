import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { ImageBackground, FlatList, StyleSheet, View, Alert, ActivityIndicator } from "react-native";
import ShopAvatar from "../components/ShopScreen/ShopAvatar";
import ShopBalance from "../components/ShopScreen/ShopBalance";
import ShopPreviewModal from "../components/ShopScreen/ShopPreviewModal";
import ShopSection from "../components/ShopScreen/ShopSection";
import { shopSectionsMock } from "../data/shop.mock";
import { ShopItem, ShopSectionData } from "../shop.types";
import { apiClient } from "../../../services/api/client";
import { useAuthStore } from "../../../services/store/useAuthStore";
import { useShopStore } from "../../../services/store/useShopStore";

const BACKGROUND_IMAGE = require("../../../../assets/background.jpg");

function ShopScreen() {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { fetchEquippedItem, equippedPreviewImage, ownedItems } = useShopStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchEquippedItem();
  }, [fetchEquippedItem]);

  const handleOpenPreview = useCallback((item: ShopItem) => {
    setSelectedItem(item);
    setIsPreviewVisible(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setSelectedItem(null);
  }, []);

  const handleBuy = useCallback(async (item: ShopItem) => {
    setIsBuying(true);
    try {
      await apiClient.post(`/shop/buy?itemId=${item.id}`, {
        frontendAccesoriesId: item.id,
        name: item.name,
        description: item.name,
        type: item.category,
        price: item.price,
      });
      Alert.alert("Sukces", "Przedmiot został zakupiony!");
      const currentStore = useAuthStore.getState();
      if (currentStore.user) {
        useAuthStore.setState({ user: { ...currentStore.user, coinsBalance: currentStore.user.coinsBalance - item.price } });
      }
      await fetchEquippedItem();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Błąd", error.response?.data?.error || "Nie udało się kupić przedmiotu.");
    } finally {
      setIsBuying(false);
      setIsPreviewVisible(false);
      setSelectedItem(null);
    }
  }, [fetchEquippedItem]);

  const handleEquip = useCallback(async (item: ShopItem) => {
    setIsBuying(true);
    try {
      await apiClient.post(`/shop/equip-item?itemId=${item.id}`);
      Alert.alert("Sukces", "Przedmiot został założony!");
      await fetchEquippedItem();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Błąd", "Nie udało się założyć przedmiotu.");
    } finally {
      setIsBuying(false);
      setIsPreviewVisible(false);
      setSelectedItem(null);
    }
  }, [fetchEquippedItem]);

  const listData = useMemo(() => {
    const data: Array<ShopSectionData & { isOwnedSection?: boolean }> = [];
    if (ownedItems.length > 0) {
      data.push({ id: "owned", title: "Twoje przedmioty", items: ownedItems, isOwnedSection: true });
    }

    const ownedIds = new Set(ownedItems.map(o => o.id));
    shopSectionsMock.forEach((section) => {
      const availableItems = section.items.filter(item => !ownedIds.has(item.id));
      if (availableItems.length > 0) {
        data.push({ ...section, items: availableItems, isOwnedSection: false });
      }
    });

    return data;
  }, [ownedItems]);

  const renderItem = useCallback(({ item }: { item: ShopSectionData & { isOwnedSection?: boolean } }) => (
    <ShopSection
      section={item}
      onItemPress={handleOpenPreview}
      isOwnedSection={item.isOwnedSection}
    />
  ), [handleOpenPreview]);

  const keyExtractor = useCallback((item: ShopSectionData) => item.id, []);

  const ListHeader = useMemo(() => (
    <ShopAvatar previewImage={equippedPreviewImage} />
  ), [equippedPreviewImage]);

  const isOwned = useMemo(() =>
    selectedItem ? ownedItems.some(o => o.id === selectedItem.id) : false,
  [selectedItem, ownedItems]);

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.background}
      resizeMode="cover"
      fadeDuration={0}
    >
      <ShopBalance balance={user?.coinsBalance || 0} />

      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={renderItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
      />

      <ShopPreviewModal
        item={selectedItem}
        visible={isPreviewVisible}
        onClose={handleClosePreview}
        onBuy={handleBuy}
        isOwned={isOwned}
        onEquip={handleEquip}
        isBuying={isBuying}
      />
    </ImageBackground>
  );
}

export default memo(ShopScreen);


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 18,
  },
});