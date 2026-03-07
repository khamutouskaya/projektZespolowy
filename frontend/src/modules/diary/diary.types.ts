// Opis jednej notatki w dzienniku
export type DiaryEntry = {
  id: string; // unikalny identyfikator wpisu
  icon: string; // emoji / ikona nastroju
  title: string; // tytuł wpisu
  preview: string; // krótki fragment treści (2 linie)
  date: string; // data utworzenia
  duration: string; // czas pisania
  mood: string; // nazwa nastroju
  section: "today" | "earlier"; // sekcja listy
};
