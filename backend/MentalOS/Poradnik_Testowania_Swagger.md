# Przewodnik testowania modułu Dziennika w Swaggerze

Niniejszy poradnik przeprowadzi Cię przez proces testowania zaimplementowanego po nowemu systemu dziennika i jego podsumowań z poziomu zintegrowanego paneli Swagger (`https://localhost:<port>/swagger`). 

## Przygotowanie – Zalogowanie i uzyskanie tokenu
Moduł *Journal* korzysta z autoryzacji chronionej hasłem Bearer Token, co znaczy, że nie wejdziesz tam jako użytkownik "z drogi". Najpierw zarejestruj się / zaloguj:

1. Znajdź sekcję przypisaną jako kontroler `Auth`. Otwórz endpoint `POST /api/auth/login` (Zaloguj) lub `POST /api/auth/register` (Zarejestruj nowo utworzone dane). 
2. Wstaw zmyśloną instancję konta:
```json
{
  "email": "test@local",
  "password": "TestPassword123!",
  "personalityType": "string"
}
```
3. Kliknij przycisk "Execute". Kod z odpowiedzią 200 pokaże ciąg znaków w zmiennej `"token"`.
4. Skopiuj sam kod autoryzacji (zaczynający się od `eyJ...`).
5. Przewiń na górę Swaggera i kliknij przycisk **Authorize** (lub kłódkę po prawej od endpointu dziennika). 
6. Do pola dialogowego wpisz ciąg wg schematu: 
`Bearer <TWÓJ_WYKOPIOWANY_TOKEN_TUTAJ>`
Zatwierdź klikając okienko Autoryzuj i Zamknij ramkę.

## 1. Testowanie ręcznych wpisów (Standard/Classic) 

**A. Tworzenie tradycyjnego wpisu do dziennika:**
- Odnajdź kontroler: `POST /api/journal` 
- W wygenerowanym polu uzupełnij body JSON:
```json
{
  "title": "Mój dzisiejszy bardzo udany dzień",
  "content": "Spacer do parku poprawił moje samopoczucie, przemyślałem kilka dróg prowadzących na skraj zalesionych łąk, i dotarłem...",
  "moodScore": 8,
  "emotions": "Ekscytacja, spokój",
  "isSummary": false,
  "entryDate": "2026-03-15T12:00:00.000Z"
}
```
- Naciśnij **Execute**. Sprawdź, czy odpowiedź poinformuje wpis (Status 201). Zauważ przydzielanie własnego klucza GUID (`id`).

**B. Czytanie i wyciąganie po czasie i datach:**
- Użyj `GET /api/journal` aby upewnić się, czy podpiął twój nowy post jako ten od góry z weryfikacją `userId` obecnego konta. Powinna wyświetlić się wygenerowana tablica Twoich wgranych Danych dla Journal.
- Sprawdź kalendarz za pomocą `GET /api/journal/date-range`. Ustaw parametry, tak aby Twoje datowanie "załapało się" na datę z punktu "A".
**startDate:** `2026-03-14` ,
**endDate:** `2026-03-16`

## 2. Testowanie funkcjonalności *AI Entry* z Voice-To-Text

Moduł ten zakłada interpretację luźnego ciągu wygenerowanego jako luźny myśli przez transkrypcję. Wykonanie wymaga sprawnej i włączonej integracji bazodanowej podkluczem OpenAI w `appsettings.json`.

- Uruchom Swagger endpoint `POST /api/journal/ai-entry`
- Obiekt `GenerateAiEntryRequestDto` wymaga wrzucenia wygenerowanych swobodnych opowiastek `TranscribedText` oraz nadania pożądanej daty z powrotem.

Ułóż ciało zapytania, by sprowokować AI by "uczesało w ład myśli":
```json
{
  "transcribedText": "No dzisiaj w sumie było dość chujowo trochę. Wkurzyłem się w pracy bo szef mi dodał z 10 godzin tasków a ja nic nie wiedziałem zeby tak miało być. No ale wróciłem do domu i żona ugotowała mi smaczny dobry rosół. Potem sobie zagrałem z moim synem i teraz się cieszę.",
  "entryDate": "2026-03-15T18:00:00.000Z"
}
```

- Po wysyłce, odczekaj na powrót instancji. Poprzednie myśli powinny zostać objęte i przekonwertowane w strukturalny wpis JSONowy - powinieneś w ciele odpowiedzi zobaczyć obiekt z sformatowaną wartością opisu jako podział zgrabnie napisany w zawiadywalnej chmurce (AI). Program dopasuje tytuł za ciebie, wyselekcjonuje również dominujące i przeciwne emocje: ("np. stres, gniew" jak i "szczęście"), a moodScore połączy do liczbowej skali. System uzna ten wygenerowany post za oficjalny wpis do Twojej tabeli kalendarza. 

## 3. Testowanie "Podsumowania Dnia" (Daily Summary) i Gamifikacji

Ważny ficzer tego panelu do odhaczania Streak-Rewardów.
Moduł wyśle na serwery informację do skrojenia z połączonych odpowiedzi (stworzony test) na uściski opisu z morałem. 

- Zejdź po liście endpointu do `POST /api/journal/daily-summary/generate`. Pamiętaj by uprzednio być zalogowanym.
- Skonstruuj treść JSON-a z ułożonym parametrem łączącym odpowiedzi z testu (czyli test symulujący, że w apce właśnie napisałeś ten test dzienny):

```json
{
  "dailyAnswers": "Tak, spotkałem się dzisiaj z kimś i pośmiałem. Nie, w żaden sposób dzisiaj nic mnie nie sfrustrowało. Czułem się stabilnie, pomimo lekkiej i szkodliwej presji bym wyszedł na zewnątrz wcześnie zrana jak inni.",
  "date": "2026-03-15T22:00:00.000Z"
}
```
- Wyślij żądanie klikając Execute. Program sklei Twój prompt, polecenie dla bota i spakuje zwrotną odpowiedź do formatki zapamiętanego w systemie Journalowego opisy (przypięty z flagą podsumowania - `isSummary: true`).

**Weryfikacja podbicia Gamifikacji (Streaków i Monety)`:**
Jeżeli wpis podsumowujący dzienną rotację zaliczył się i nie wyrzucił z programu "Internal Errora", wywołał skrypt przybijający system *streakowej-monety* dla tego profilu.

Sprawdź, czy serwer prawidłowo przeklepał Streak: 
Skieruj kroki na sprawdzacz bieżących danych: `GET /api/users/me` z grupy zasobów systemu. Po naciśnięciu wykonaj: ujrzysz powrót pełnej encji przypisanej swojemu autoryzowanemu bytu i powinieneś dojrzeć, że "StreakActive", w którym się testowałeś pokaże prawdę, "StreakCount" powiększył swój indeks, a `CoinsBalance` nabiło zasobne środki za bycie pilnym!

## 4. Agregacja (Test zliczeń podsumowujących z wyodrębnionego panelu)
Użyj zasobu `GET /api/journal/summary/{date}`, wpisując dla opcji parameters na formatkę np. `2026-03-15` żeby sprawdzić system zliczeń uśredniającego podsumowania per dany okres 24 godzinnych zapisów z dziennika, powzięty i odłożony we wcześniejszych etapach. Zobaczysz "entryCount", łączny spis ujęć oraz uśredniony współczynnik samopoczucia (`averageMoodScore`).