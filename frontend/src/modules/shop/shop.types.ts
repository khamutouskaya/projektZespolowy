export type ShopCategory = "accessory" | "shoes" | "background";

export type ShopItem = {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  thumbnail: any;
  preview: any;
};

export type ShopSectionData = {
  id: string;
  title: string;
  items: ShopItem[];
};