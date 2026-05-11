import { create } from "zustand";
import { apiClient } from "../api/client";
import { shopSectionsMock } from "../../modules/shop/data/shop.mock";
import { ShopItem } from "../../modules/shop/shop.types";

interface ShopState {
  equippedPreviewImage: any | null;
  ownedItems: ShopItem[];
  fetchEquippedItem: () => Promise<void>;
  setEquippedPreview: (image: any | null) => void;
}

export const useShopStore = create<ShopState>((set) => ({
  equippedPreviewImage: null,
  ownedItems: [],
  fetchEquippedItem: async () => {
    try {
      const { data } = await apiClient.get(`/shop/my-items?_t=${Date.now()}`);
      if (Array.isArray(data)) {
        const owned = data.map((d: any) => {
          return shopSectionsMock.flatMap(s => s.items).find(i => i.id === d.frontendAccesoriesId);
        }).filter(Boolean) as ShopItem[];

        const activeItem = data.find((i: any) => i.isActive);
        if (activeItem) {
          const foundItem = shopSectionsMock
            .flatMap((section) => section.items)
            .find((item) => item.id === activeItem.frontendAccesoriesId);
          set({ equippedPreviewImage: foundItem?.preview || null, ownedItems: owned });
        } else {
          set({ equippedPreviewImage: null, ownedItems: owned });
        }
      }
    } catch (e) {
      console.log("Failed to fetch equipped item", e);
    }
  },
  setEquippedPreview: (image) => set({ equippedPreviewImage: image }),
}));
