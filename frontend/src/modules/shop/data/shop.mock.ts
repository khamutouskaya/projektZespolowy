import { ShopSectionData } from "../shop.types";

export const shopSectionsMock: ShopSectionData[] = [
  {
    id: "accessories",
    title: "Szafa chmurki",
    items: [
      {
        id: "hat_pink",
        name: "Różowa czapka",
        category: "accessory",
        price: 120,
        thumbnail: require("../../../../assets/shop/items/hat-pink.png"),
        preview: require("../../../../assets/shop/preview/preview-hat-pink.png"),
      },
      {
        id: "hat_purple",
        name: "Fioletowy kapelusz",
        category: "accessory",
        price: 140,
        thumbnail: require("../../../../assets/shop/items/hat-purple.png"),
        preview: require("../../../../assets/shop/preview/preview-hat-purple.png"),
      },
      {
        id: "hat_beige",
        name: "Beżowy kapelusz",
        category: "accessory",
        price: 150,
        thumbnail: require("../../../../assets/shop/items/hat-beige.png"),
        preview: require("../../../../assets/shop/preview/preview-hat-beige.png"),
      },
      {
        id: "cap_blue",
        name: "Niebieska czapka",
        category: "accessory",
        price: 110,
        thumbnail: require("../../../../assets/shop/items/cap-blue.png"),
        preview: require("../../../../assets/shop/preview/preview-cap-blue.png"),
      },
      {
        id: "glasses_round",
        name: "Okrągłe okulary",
        category: "accessory",
        price: 130,
        thumbnail: require("../../../../assets/shop/items/glasses-round.png"),
        preview: require("../../../../assets/shop/preview/preview-glasses-round.png"),
      },
      {
        id: "glasses_aviator",
        name: "Złote aviatory",
        category: "accessory",
        price: 150,
        thumbnail: require("../../../../assets/shop/items/glasses-aviator-gold.png"),
        preview: require("../../../../assets/shop/preview/preview-glasses-aviator-gold.png"),
      },
      {
        id: "scarf_rainbow",
        name: "Tęczowy szalik",
        category: "accessory",
        price: 140,
        thumbnail: require("../../../../assets/shop/items/scarf-rainbow.png"),
        preview: require("../../../../assets/shop/preview/preview-scarf-rainbow.png"),
      },

      {
        id: "headphones_pink",
        name: "Różowe słuchawki",
        category: "accessory",
        price: 160,
        thumbnail: require("../../../../assets/shop/items/headphones-pink.png"),
        preview: require("../../../../assets/shop/preview/preview-headphones-pink.png"),
      },
      {
        id: "bow_pink",
        name: "Różowa kokarda",
        category: "accessory",
        price: 110,
        thumbnail: require("../../../../assets/shop/items/bow-pink.png"),
        preview: require("../../../../assets/shop/preview/preview-bow-pink.png"),
      },
    ],
  },
];