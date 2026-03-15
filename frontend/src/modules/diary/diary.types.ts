// Opis jednej notatki w dzienniku
export type SyncStatus = "pending" | "synced" | "failed"; //do synchro z serwerem
export type DiaryEntry = {
  id: string; // unikalny identyfikator wpisu
  icon: string; // emoji / ikona nastroju
  title: string; // tytuł wpisu
  preview: string; // podsumowanie dnia
  date: string; // data utworzenia
  duration: string; // czas pisania
  mood: string; // nazwa nastroju
  section: "today" | "earlier"; // sekcja listy
  userId: string; // izolacja danych między użytkownikami, żeby nie wystarczyło się zalogowć dowolnym kontem żeby mieć dostęp
  content: string; // pełna treść wpisu
  tags?: string; // tagi jako JSON string
  syncStatus: SyncStatus; // do przyszłej synchronizacji
  serverId?: string; // ID z serwera po synchronizacji
  updatedAt: string;
};
