export const typography = {
  heading1: {
    fontSize: 26, // крупные заголовки экранов (np. "Jak się dziś czujesz?")
    fontWeight: "700" as const,
  },

  title: {
    fontSize: 18, // подзаголовки или названия блоков (np. sekcja, karta)
    fontWeight: "600" as const,
  },

  input: {
    fontSize: 15, // placeholder
    fontWeight: "500" as const,
  },

  body: {
    fontSize: 15, // основной текст интерфейса (opis, tekst w kartach) самый базовый шрифт
    fontWeight: "400" as const,
  },

  small: {
    fontSize: 16, // маленькие подписи (np. label nad inputem)
    fontWeight: "500" as const,
  },

  caption: {
    fontSize: 13, // очень мелкий текст: подсказки, вторичная информация
    fontWeight: "500" as const,
  },
};
