## Dość ważne

musicie mieć w folderze frontendu plik .env z linijką EXPO_PUBLIC_API_URL="http://10.0.2.2:5076/api"
//10.0.2.2 - android symulator
//z aplikacji expo go wpisujemy ipv4 addres computera (ipconfig)
Albo inny adres, zależy od backendu, w razie czego przyjżyjcie się logom. Potem będzie to trzeba zastąpić rzeczywistym adresem backendu na serwerze i https, ale ten jest lokalny.

Może nie działać jeśli korzystacie z telefonu zamiast emulatora z Android Studio, wtedy adres będzie inny (zamiast 10.0.2.2, rzeczywisty adres IP komputera w sieci i będziecie raczej musieli być na takiej samej sieci)

## Dziennik — dokumentacja gałęzi

Zmieniłem parę ekranów żeby tam wstawić tą komunikację, też nie miałem pewności czy ekran DiaryNoteScreen, miał mieć czy nie miał mieć przycisku do zapisu, więc dodałem tymczasowy (niezbyt widoczny / trzeba przescrollować żeby go zobaczyć) i czy w podglądzie ma się wyświetlać podsumowanie, czy początek całości, czy tylko początek podsumowania (na razie jest całe podsumowanie).

## Co zostało dodane

Ta gałąź implementuje lokalny dziennik z obsługą trybu offline i przygotowaną infrastrukturą do synchronizacji z serwerem, oraz logowanie i rejstrację.

---

## Instalacja itp.

W dużej mierze kierować się instrukcją z backendu, zainstalować zależności z dołu, zwrócić uwagę żeby dane wprowadzone w tworzeniu bazy były takie same jak w appsettings w folderze backendu (powinno być ok). Odpalić Docker, włączyć bazę, włączyć backend (powinno wyskoczyć w logach że połączenie udane), potem włączyć aplikację.

Możliwe błędy:
Windows może próbować używać innej, wbudowanej bazy, wtedy należy ją wyłączyć
Niezgodność loginu i hasła między bazą a appsettings
Niezgodność portu między .env, a tym gdzie backend nasłuchuje (wyświetla się w logach backendu)
Backend próbuje używać https, zamiast http, nie mamy certyfikatu, więc możemy kożystać tylko z http, odpowiednia linijka w chyba Program.cs musi być wykomentowana

## Zmiany w typie `DiaryEntry`

Oryginalny typ został rozszerzony o nowe pola. Stare pola pozostały bez zmian.

| Pole         | Było | Jest | Opis                                            |
| ------------ | ---- | ---- | ----------------------------------------------- |
| `id`         | ✅   | ✅   | bez zmian                                       |
| `icon`       | ✅   | ✅   | bez zmian                                       |
| `title`      | ✅   | ✅   | bez zmian                                       |
| `preview`    | ✅   | ✅   | bez zmian                                       |
| `date`       | ✅   | ✅   | bez zmian                                       |
| `duration`   | ✅   | ✅   | bez zmian                                       |
| `mood`       | ✅   | ✅   | bez zmian                                       |
| `section`    | ✅   | ✅   | bez zmian                                       |
| `userId`     | ❌   | ✅   | ID użytkownika — izolacja danych między kontami |
| `content`    | ❌   | ✅   | pełna treść wpisu                               |
| `tags`       | ❌   | ✅   | tagi jako JSON string, np. `["Spokój"]`         |
| `syncStatus` | ❌   | ✅   | `"pending"` / `"synced"` / `"failed"`           |
| `serverId`   | ❌   | ✅   | ID wpisu nadane przez serwer po synchronizacji  |
| `updatedAt`  | ❌   | ✅   | czas ostatniej edycji                           |

---

## Architektura

```
┌─────────────────────────────────────────────────────────┐
│                     Aplikacja                           │
│                                                         │
│  DiaryNoteScreen ──► useDiaryEntries (hook)             │
│  DiaryEntryScreen        │                              │
│  DiaryScreen ◄───────────┘                              │
│                          │                              │
│                    diaryService                         │
│                          │                              │
│                    SQLite (diary.db)                     │
│                    lokalnie na urządzeniu               │
└──────────────────────────┬──────────────────────────────┘
                           │ (przyszłość)
                           ▼
              ┌────────────────────────┐
              │  diarySyncService      │
              │  (jeszcze nie gotowy)  │
              │          │             │
              │          ▼             │
              │  Backend API           │
              │  POST /api/diary       │
              └────────────────────────┘
```
```
Komponent (np. login.tsx)
│ wywołuje hook
▼
useAuthMutations.ts (useLoginMutation, useRegisterMutation)
│ wywołuje funkcję API
▼
auth.ts (authApi.login / authApi.register)
│ używa klienta HTTP
▼
client.ts (apiClient — axios)
│ HTTP request
▼
Backend ASP.NET Core
```
client.ts tworzy i konfiguruje klienta HTTP (axios). Dzięki interceptorom automatycznie doklejа token do każdego wychodzącego requestu i nasłuchuje odpowiedzi, jeśli backend zwróci 401, wylogowuje użytkownika.

Zasadniczo dokleja znaczek i wpisuje adres serwera

auth.ts definiuje konkretne funkcje HTTP, każda wie pod jaki endpoint uderzyć i jakie dane wysłać. Sam axios zajmuje się resztą.

Nie wie gdzie jest endpoint, ale wie jaki chce, wysyła żądanie które jest przechwytywane przez client.ts

useAuthMutations.ts łączy odpowiedź backendu z lokalnym stanem aplikacji, zapisuje token na dysku, aktualizuje store i nawiguje użytkownika.

Dla logowania flow wygląda mniej więcej tak:
```
Użytkownik wpisuje email + hasło i klika "Zaloguj się"
│
▼
handleLogin() w login.tsx
│
▼
loginMutation.mutate({ email, password })
│
▼
authApi.login() → POST http://10.0.2.2:5076/api/auth/login
│
▼ odpowiedź 200 OK
{ token: "eyJ...", user: { id, email, personalityType, isAdmin } }
│
▼
loginToStore(token, user) zapisuje sesję i przekierowuje do aplikacji

        ▼ odpowiedź 401

Alert "Nieprawidłowy email lub hasło"
```
---

## Jak działa zapis wpisu

```
Użytkownik pisze tekst
        │
        ▼
DiaryEntryScreen (edytor tekstu)
        │ router.replace z params.text
        ▼
DiaryNoteScreen (wybór nastroju, tagu, podsumowania)
        │ handleSave()
        ▼
useDiaryEntries.addEntry()
        │
        ▼
diaryService.create(userId, data)
        │ serializuje cały wpis do JSON
        ▼
SQLite INSERT — sync_status = "pending"
        │
        ▼
DiaryScreen — useFocusEffect odświeża listę
```

## Przechowywanie danych

To możliwe będzie zmienione w przyszłości, zależy od backendu

Dane wpisu są serializowane do jednego JSON stringa i trzymane w kolumnie `content`:

```
SQLite tabela diary_entries:
┌────────────┬────────────┬───────────────────────────────────┬─────────────┬──────────┬────────────┐
│ id         │ user_id    │ content (JSON)                    │ sync_status │ server_id│ updated_at │
├────────────┼────────────┼───────────────────────────────────┼─────────────┼──────────┼────────────┤
│ uuid-123   │ uuid-usr   │ {"title":"15.03","mood":"😊",...} │ pending     │ null     │ 2026-03-15 │
└────────────┴────────────┴───────────────────────────────────┴─────────────┴──────────┴────────────┘
```

Podejście z JSON stringiem oznacza że dodanie nowego pola do wpisu nie wymaga migracji bazy danych.

## Nowe pliki

```
src/modules/diary/
  db/
    diaryDb.ts              ← inicjalizacja SQLite, schemat tabeli
  services/
    diaryService.ts         ← CRUD na lokalnej bazie (getAll, create, update, delete)
  hooks/
    useDiaryEntries.ts      ← hook React, łączy diaryService z komponentami

src/hooks/
  useNetworkStatus.ts       ← wykrywanie połączenia sieciowego
```

## Zmodyfikowane pliki

```
src/modules/diary/
  diary.types.ts            ← rozszerzony typ DiaryEntry
  components/
    diaryNote/
      MoodSelector.tsx      ← stan przeniesiony do rodzica (controlled component)
      TagSelector.tsx       ← stan przeniesiony do rodzica (controlled component)
      SummaryInput.tsx      ← dodana możliwość edycji (prop onChangeSummary)
    diaryScreen/
      DiaryEntryCard.tsx    ← wyświetla mood, tagi i podsumowanie
    diaryEntry/
      DiaryEntryHeader.tsx  ← naprawiony przycisk OK (wywołuje onSave)
  screens/
    DiaryScreen.tsx         ← useFocusEffect odświeża wpisy po powrocie
    DiaryNoteScreen.tsx     ← podłączony zapis, stan mood/tag/summary
    DiaryEntryScreen.tsx    ← przekazuje tekst z powrotem przez params

app/_layout.tsx             ← dodany AppInit z hydrate()
app/index.tsx               ← guard nawigacyjny (sprawdza isAuthenticated)
```

---

## Zależności
```
npm install

npx expo install zustand
npx expo install jwt-decode
npx expo install expo-splash-screen
npx expo install axios
npx expo install expo-secure-store
npm install @tanstack/react-query
npx expo install @react-native-community/netinfo
npx expo install expo-sqlite
npx expo install expo-crypto
```
