export const typography = {
  heading1: {
    fontSize: 26, // duże nagłówki ekranów (np. "Jak się dziś czujesz?")
    fontWeight: "700" as const,
  },

  name: {
    fontSize: 30, // tytuły powitalne i imię użytkownika
    fontWeight: "700" as const,
  },

  title: {
    fontSize: 18, // podtytuły i nazwy bloków (np. sekcja, karta)
    fontWeight: "600" as const,
  },

  titleSmall: {
    fontSize: 14,
    fontWeight: "500",
  },

  input: {
    fontSize: 15, // tekst w polach wprowadzania
    fontWeight: "500" as const,
  },

  body: {
    fontSize: 15, // podstawowy tekst interfejsu (opisy, treść kart)
    fontWeight: "400" as const,
  },

  small: {
    fontSize: 16, // małe etykiety (np. label nad polem)
    fontWeight: "500" as const,
  },

  caption: {
    fontSize: 13, // bardzo drobny tekst: podpowiedzi, informacje pomocnicze
    fontWeight: "500" as const,
  },
};
