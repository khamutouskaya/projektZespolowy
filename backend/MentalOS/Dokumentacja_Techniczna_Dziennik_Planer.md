# Dokumentacja Techniczna: Moduł Dziennika (Journal), Planera (Planner) oraz Mechanizm Podsumowania Dnia (Daily Summary)

Niniejsza dokumentacja jest przeznaczona dla programistów backendowych (ASP.NET Core) utrzymujących i rozwijających projekt. Opisuje architekturę, encje oraz zależności modułów odpowiedzialnych za śledzenie postępów, organizację zadań i wsparcie psychologiczne użytkownika (AI).

---

## 1. Moduł Planera (Planner)

Moduł ten służy do organizowania zadań (TODO / Habit tracking) w czasie.

### Encja i Struktura Bazy Danych
Zadania przechowywane są w tabeli `planner_tasks` za pośrednictwem encji `MentalOS.Domain.PlannerTask`.
Kluczowe właściwości encji:
- `UserId (Guid)` – klucz obcy powiązany z użytkownikiem.
- `TaskDate (DateTime)` – termin zaplanowanego zadania.
- `HasTime (bool)`, `ReminderTime (DateTime?)` – kontrola powiadomień i godzin dla danego zadania.
- `Priority (PlannerTaskPriority)` – Enum przyjmujący wartości `Normal` lub `High`.
- `Recurrence (PlannerTaskRecurrence)` - Enum wspierający logikę powtarzalności zadań (od `None` do np. `Weekly` itd.).
- `IsCompleted (bool)` – stan wykonania; przełączenie modyfikuje pole `CompletedAt`.
- `Category (string)`, `Icon (string)` – tagowanie zadań do reprezentacji w warstwie Frontendu.

### Kontroler i Endpointy (`PlannerController.cs`)
Każdy endpoint wymaga autoryzacji (JWT Bearer) i mapuje obiekty na klasę bazową `PlannerTaskDto` przed zwróceniem na zewnątrz API.

- **`GET /api/planner`** - pobiera pełną, niefiltrowaną historię zadań powiązaną z `UserId`.
- **Filtry ram czasowych:**
  - **`GET /api/planner/daily?date={date}`** - zwraca zadania zapadające w oknie `startOfDay` do `endOfDay` (uwzględnia strefy czasowe poprzez rzutowanie `.ToUniversalTime()`).
  - **`GET /api/planner/weekly?startDate={date}`** - pobiera ramę 7 dni (kalendarz tygodniowy).
  - **`GET /api/planner/monthly?year={y}&month={m}`** - logiczna analiza dla zadzielenia ram miesięcznych, wylicza początek i skok na kolejny miesiąc dla kontrolki `endOfMonth`.
- **`GET /api/planner/{id}`** - zwraca ujednoznaczniony dokument zadania.
- **`POST /api/planner`** - przyjmujący model `CreatePlannerTaskDto` zapis operacji do bazy wraz z nadaniem znaczników tworzenia `CreatedAt` oraz inicjalizacją na twardo `IsCompleted=false`.
- **`PUT /api/planner/{id}`** - nadpisuje zmienne dla już istniejącego zasobu przez `UpdatePlannerTaskDto`, jeśli status się zmienił wylicza nowy stempel dla `CompletedAt`.
- **`PATCH /api/planner/{id}/complete?isCompleted={bool}`** - tzw. quick-trigger pozwalający frontendowi na bezinwazyjne przełączanie statusów w oparciu jedynie o flagę (oszczędność w stosunku do wysyłania całego obiektu `PUT`).
- **`DELETE /api/planner/{id}`** - usuwa fizycznie z bazy rekord (`_context.PlannerTasks.Remove(task)`). Należy zważyć uwagę w przyszłości nad modyfikacją w razie potrzeby tzw. *"Soft-Delete"*.

---

## 2. Moduł Dziennika (Journal)

Pozwala użytkownikom prowadzić ewidencję własnego nastroju, przemyśleń i notatek za pomocą swobodnego tekstu (lub wejścia Voice-to-Text).

### Encja i Struktura Bazy Danych
Dane zapisywane do tabeli `journal_entries` poprzez `MentalOS.Domain.JournalEntry`.
Kluczowe właściwości encji:
- `Title (string)`, `Content (string)` – treść właściwa. Zawartość może być pisana ręcznie lub generowana automatycznie przez AI.
- `MoodScore (int?)` – ocena w skali liczbowej (np. 1-10) określana przy zapisie wpisu z dziennika (Manualnie, lub dekodowana przez AI). Niezbędna do zliczania trendów długoterminowych.
- `Emotions (string?)` - tekstowe wymienienie pozycjonowanych emocji. 
- `IsSummary (bool)` – **Flaga o krytycznym znaczeniu:** pozwala rozróżnić typowy wpis (przemyślenia w trakcie dnia) od wygenerowanego "Podsumowania Dnia". Używane we flagach i przy filtracji zapytań (często chcemy pobierać wpisy wykluczając jednocześnie podsumowania dla uniknięcia duplikacji).

### Kontroler i Endpointy (`JournalController.cs`)
Podobnie jak planera, kontroler `Authorize` sprzężony pod routingiem `/api/journal`. 

- **CRUD Zwykłych Wpisów:**
  - `GET /api/journal` - Standardowy zwrot ze stanem `OrderByDescending`.
  - `GET /api/journal/date-range?startDate={sd}&endDate={ed}` - Pozwala na generowanie tzw. "wykresów okienkowych" zawężając okno czasowe pobierania przez aplikację React/Flutter do danych zaledwie interwałów (przeciwdziała przeciążeniom przy dużej liście).
  - `POST`, `PUT`, `GET /{id}`, `DELETE` - Klasyczne operacje na instancji bazy. Zawsze wpięte z validacją identyfikatora przypisanego do Claim JWT: `j.UserId == userId`.
- **Narzędzia analityczne i operacyjne asystenta (AI):**
  - **`GET /api/journal/summary/{date}`** – pobiera wpisy z zadanego okna dziennego, ale co ważne, podlicza oraz zwraca zanonimizowaną na froncie średnią wartość `MoodScore` i policzoną pętle sum całkowitych `entryCount` na podstawie wpisów z danego momentu. Niezbędne do generowania frontowego wskaźnika oceny samopoczucia danego dnia.
  - **`POST /api/journal/ai-entry`** - Endpoint generujący tzw. wpis samoobsługowy. Odbiera czysty, skompilowany tekst z funkcji Voice-To-Text interfejsu klienta na polu `TranscribedText` i nakazuje z góry określonym systemowym promptem OpenAI dokonać syntezy do zwracanego obiektu JSON zawierającego od razu estymowane oceny dla `Title, Content, MoodScore i Emotions`. Obejmuje bloki silnego `Try Catch` ze wsparciem bezpiecznego rzutowania klas i usuwania artefaktów gpt z jsona by nie zepsuć zapisu formatki i wymusić udany zapis do bazy z danymi tymczasowymi.

---

## 3. Mechanizm Podsumowania Dnia (Daily Summary)

Trzon analityczny i terapeutyczny aplikacji integrujący bazę wiedzy z API asystenta asynchronicznego opartego na rozwiązaniu podpiętej sieci (OpenAI GPT).  

### Generowanie Podsumowania (`POST /api/journal/daily-summary/generate`)
Proces wywoływania i budowania podsumowania to wielowątkowa agregacja informacji odpytujących z `JournalController`:

1. **Zbieranie Kontekstu Zadaniowego:** Backend odpytuje bazę dla tabeli `planner_tasks` używając zmiennej okna od `startOfDay` do `endOfDay`. Generowany jest łańcuch znaków opisujący zadania np.: `"Trening (Zakończone); Zapłata rachunków (Niezakończone)"`.
2. **Zbieranie Kontekstu Psychologicznego:** Odczytywany jest typ osobowości użytkownika (tabela `personality_profiles`).
3. **Zbieranie Kontekstu Emocjonalnego:** Pobrane zostają obiekty `JournalEntry` na przestrzni okna czasu do 7 dni w przeszłość, z czego liczona jest zagregowana wartość matematyczna do stworzenia stringa w postaci `avgMoodData`. To pozwala asystentowi zidentyfikować długoterminowe osłabienie nastroju.
4. **Skonstruowanie Instrukcji (System Prompt):** Do zapytania wysyłanego poprzez wstrzyknięty w DI `IAiChatService` (serwis fasadujący OpenAI API) dodawane są zmienne wstrzyknięte interpolacją (`$`). Asystent jest proszony o wygenerowanie spersonalizowanego do danego typu osobowości opisu interpretującego wydarzenia i emocje.
5. **Weryfikacja podsumowań:** Moduł sprawdza poprzez instrukcję Any() czy encja przypisana do tego zdarzenia nie naruszy bezpieczeństw poprzez stworzenie duplikacji i zabezpiecza transakcję odczytu jako flagi boolean by uniknąć wywoływania sztucznej inflacji danych dla asystenta.
6. **System Grywalizacji (Streak):** Zapisywanie samego podsumowania na w pełni utworzonej i wypełnionej klasie. Następny blok logiki upewnia się, że użytkownik w wybranym dniu zrealizował warunek *Zwykłego Wpisu*. Jeśli on istnieje serwer przechodzi w przeszłość `yesterdayStart -> yesterdayEnd` w celu określenia czy użytkownik wydał taką samą transakcję `hadSummaryYesterday && hadNormalEntryYesterday`. Jeśli odpytywanie bazy potwierdzi te kroki powiązany w kluczu `users.Id` portfel `CoinsBalance` pomnżony jest adekwatnie o mnożnik (np. +5 za każdy poziom *Streak'u*), a parametr *StreakCount* zostaje utrzymany i powiększany zamiast deklasować na null. Zabezpiecza nas to przed próbą wygenerowania sztucznego monetyzowania waluty przez samego asystenta (podsumowanie ma charakter stricte motywacyjny, ale nagroda przysługuje za manualny wpis refleksyjny w dzienniku).

---

## 4. Architektura Usług w tle: Powiadomienia 

Aby wspierać wywoływanie akcji cyklicznej po stronie użytkowników (przypominanie o wygenerowaniu "Podsumowania Dnia" po zmroku), wdrożono implementację logiki rozkładowej.

### Klasa `DailySummaryNotificationService`
Dziedziczy z abstrakcji .NET `BackgroundService` i została zarejestrowana na poziomie `Program.cs` (`AddHostedService`).

**Jak to działa technicznie w kodzie:**
- Zaimplementowano nieskończoną pętlę asynchroniczną sprawdzającą stan aplikacji `ExecuteAsync`.
- Jeśli zmienna wirtualnego zegara serwerowego pasuje rozmiarem co do godziny ustalonej (`NotificationHour = 20`), serwer przechodzi do analizy wysyłek i wykonuje pauzę asynchroniczną na godzinę. Zabezpiecza to przed zablokowaniem całego wątku przy odpytywaniu bazy danych (w innym przypadku odpytywanie zachodzi w małym interwale 15-minutowym sprawdzającym czy wskazówka wbiła już daną godzinę).
- Usługa powołuje do życia cykl odczytu bazy w obrębie efemerycznego `CreateScope()` poprzez zainjektowany z DI interfejs dostawcy obiektów, gdyż usługa typu natywnego (`Singleton/Hosted Service`) sama w sobie nie potrafi bezpiecznie przyjąć do pamięci wywołania z zakresowego (`Scoped`) takiego jak fabryka EF - w tym wypdku `AppDbContext`.
- Poprzez proste odpytywania list na poziomie bazy dokonuje szybkiej eliminacji: wpisy wyodrębniane są w listę identyfikatorów posługując się logiką braku (`!summariesToday.Contains()`), tworzona jest lista mailingowa wyłacznie dla kont pozbawianych "ukończenia" logiki danego dnia. Dopiero na zredukowanej matrycy dokonywana jest pętla.
- Generuje pętlę po pozostałych użytkownikach jako przygotowanie na instalacje np. protokołu Firebase lub serwisu WebNotifications, zachowując bezwzględnie stabilność bazy przy odseparowaniu transakcji logowania z wstrzykniętego `ILogger` API.

Dzięki temu system powiadomień stał się asynchronicznie separacyjny z cyklami pracy serwera. Tworzy środowisko pro-aktywne zamiast czekać na wywołanie kontrolera API z warstwy SPA/klienta mobilnego.