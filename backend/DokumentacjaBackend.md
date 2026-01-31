# Dokumentacja Backend - MentalOS API

## Spis Treœci
1. Opis Projektu
2. Technologie
3. Architektura
4. Struktura Projektu
5. Konfiguracja
6. Autoryzacja i Bezpieczeñstwo
7. Endpointy API
8. Modele Danych
9. Serwisy
10. Middleware
11. Logowanie

---

## 1. Opis Projektu

**MentalOS API** to backend aplikacji do monitorowania zdrowia psychicznego. Aplikacja umo¿liwia u¿ytkownikom:
- Rejestracjê i logowanie (lokalne + OAuth)
- Zarz¹dzanie profilem u¿ytkownika
- Autoryzacjê przez Google i Facebook
- System ról (user, admin)
- Gamifikacjê (streaki, monety, premium)

### G³ówne Funkcjonalnoœci:
? RESTful API zgodne z najlepszymi praktykami  
? Autoryzacja JWT Bearer  
? OAuth 2.0 (Google, Facebook)  
? System ról i uprawnieñ  
? Logowanie zdarzeñ (Serilog)  
? Dokumentacja API (Swagger)  
? Obs³uga b³êdów (GlobalErrorHandler)  

---

## 2. Technologie

### Backend
- **Framework:** ASP.NET Core 8.0 (Web API)
- **Jêzyk:** C# 12.0
- **Baza danych:** PostgreSQL 16+
- **ORM:** Entity Framework Core 8.0.11
- **Provider:** Npgsql.EntityFrameworkCore.PostgreSQL 8.0.11

### Autoryzacja
- **JWT:** Microsoft.AspNetCore.Authentication.JwtBearer 8.0.11
- **Haszowanie hase³:** ASP.NET Core Identity PasswordHasher
- **OAuth:** 
  - Google.Apis.Auth 1.69.0
  - Facebook Graph API (REST)

### Narzêdzia
- **Logowanie:** Serilog.AspNetCore 8.0.3
- **Dokumentacja:** Swashbuckle.AspNetCore 6.5.0
- **HTTP Client:** System.Net.Http (wbudowany)

---

## 3. Architektura

Projekt wykorzystuje **architekturê warstwow¹**:

```
???????????????????????????????????????
?        Controllers (API)            ?  ? Endpointy REST
???????????????????????????????????????
?        Services (Logika)            ?  ? Logika biznesowa
???????????????????????????????????????
?     Data (Dostêp do DB)             ?  ? EF Core DbContext
???????????????????????????????????????
?      Domain (Modele)                ?  ? Encje bazodanowe
???????????????????????????????????????
?    Middleware (Obs³uga)             ?  ? Globalne handlery
???????????????????????????????????????
          ?
    PostgreSQL Database
```

### Wzorce projektowe:
- **Repository Pattern** (poprzez EF Core DbContext)
- **Dependency Injection** (wbudowane w ASP.NET Core)
- **Middleware Pattern** (obs³uga b³êdów)
- **Service Layer Pattern** (oddzielenie logiki biznesowej)

---

## 4. Struktura Projektu

```
MentalOS/
?
??? Controllers/              # Kontrolery API (endpointy)
?   ??? AuthController.cs    # Rejestracja, logowanie, OAuth
?   ??? UsersController.cs   # Profil u¿ytkownika
?   ??? AdminController.cs   # Panel administratora
?
??? Domain/                   # Modele encji (tabele DB)
?   ??? User.cs              # U¿ytkownik
?   ??? Role.cs              # Role i przypisania
?   ??? PersonalityProfile.cs # Profil osobowoœci
?
??? Data/                     # Warstwa dostêpu do danych
?   ??? AppDbContext.cs      # Kontekst EF Core
?
??? Services/                 # Logika biznesowa
?   ??? TokenService.cs      # Generowanie JWT
?   ??? ITokenService.cs     # Interfejs
?   ??? OAuthService.cs      # Logika OAuth
?   ??? IOAuthService.cs     # Interfejs
?
??? Middleware/               # Middleware'y
?   ??? ErrorHandlingMiddleware.cs  # Globalna obs³uga b³êdów
?
??? Properties/               # Konfiguracja projektu
?   ??? launchSettings.json  # Porty, œrodowiska
?
??? Logs/                     # Logi Serilog (generowane automatycznie)
?   ??? log-YYYY-MM-DD.txt
?
??? Program.cs                # Punkt wejœcia aplikacji
??? appsettings.json          # Konfiguracja (connection string, JWT, OAuth)
??? appsettings.Development.json  # Konfiguracja dev (nie commitowaæ!)
??? MentalOS.csproj          # Definicja projektu
??? Dockerfile               # Konteneryzacja Docker
??? MentalOSdb.sql           # Schemat bazy danych
?
??? test-oauth-*.html         # Strony testowe OAuth
```

---

## 5. Konfiguracja

### 1. appsettings.json

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=mentalos;Username=postgres;Password=your_password"
  },
  
  "Jwt": {
    "Key": "your-super-secret-key-minimum-32-characters-long",
    "Issuer": "MentalOS",
    "Audience": "MentalOS-Users"
  },
  
  "OAuth": {
    "Google": {
      "ClientId": "your-google-client-id.apps.googleusercontent.com",
      "ClientSecret": "your-google-client-secret"
    },
    "Facebook": {
      "AppId": "your-facebook-app-id",
      "AppSecret": "your-facebook-app-secret"
    }
  }
}
```

### 2. Porty

Aplikacja domyœlnie dzia³a na:
- **HTTPS:** https://localhost:5078
- **HTTP:** http://localhost:5076

Zmiana w `Properties/launchSettings.json`

---

## 6. Autoryzacja i Bezpieczeñstwo

### 1. JWT (JSON Web Tokens)

Aplikacja u¿ywa JWT do autoryzacji. Token jest generowany przy logowaniu i zawiera:

**Claims:**
- `NameIdentifier` - ID u¿ytkownika (Guid)
- `Email` - Email u¿ytkownika
- `Role` - Role u¿ytkownika (mo¿e byæ wiele)

**Wa¿noœæ:** 24 godziny

**Algorytm:** HMAC SHA-256

**Przyk³ad tokenu:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Role i Uprawnienia

System obs³uguje role:

| Rola | Uprawnienia |
|------|-------------|
| `user` | Dostêp do w³asnego profilu, standardowe funkcje |
| `admin` | Pe³ny dostêp, zarz¹dzanie u¿ytkownikami, logi |
| `specialist` | (Zarezerwowane na przysz³oœæ) |

**Autoryzacja w kontrolerach:**
```csharp
[Authorize]                  // Wymaga zalogowania
[Authorize(Roles = "admin")] // Wymaga roli admin
```

### 3. OAuth 2.0

#### Google OAuth
1. U¿ytkownik loguje siê przez Google
2. Frontend otrzymuje ID Token
3. Backend waliduje token przez `Google.Apis.Auth`
4. Jeœli u¿ytkownik nie istnieje - zostaje utworzony
5. Zwracany jest JWT token

#### Facebook OAuth
1. U¿ytkownik loguje siê przez Facebook
2. Frontend otrzymuje Access Token
3. Backend waliduje token przez Facebook Graph API
4. Pobiera dane u¿ytkownika (email, name)
5. Jeœli u¿ytkownik nie istnieje - zostaje utworzony
6. Zwracany jest JWT token

### 4. Haszowanie hase³

U¿ywamy `ASP.NET Core Identity PasswordHasher`:
- PBKDF2 z HMAC-SHA256
- 10000 iteracji
- Salt losowy dla ka¿dego has³a

### 5. CORS

Domyœlnie CORS jest otwarty dla wszystkich Ÿróde³ (dla aplikacji mobilnej).

**?? PRODUKCJA:** Ogranicz do konkretnych domen!

```csharp
policy.WithOrigins("https://twoja-aplikacja.com")
      .AllowAnyMethod()
      .AllowAnyHeader();
```

---

## 7. Endpointy API

### ?? Public (bez autoryzacji)

#### **POST** `/api/auth/register`
Rejestracja nowego u¿ytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "personalityType": "balanced"  // opcjonalnie: supportive, balanced, direct
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJI...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "personalityType": "balanced"
  }
}
```

---

#### **POST** `/api/auth/login`
Logowanie lokalnie (email + has³o).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJI...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "personalityType": "balanced",
    "isAdmin": false
  }
}
```

---

#### **POST** `/api/auth/google`
Logowanie przez Google OAuth.

**Request Body:**
```json
{
  "idToken": "google-id-token-from-frontend"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJI...",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "isAdmin": false
  }
}
```

---

#### **POST** `/api/auth/facebook`
Logowanie przez Facebook OAuth.

**Request Body:**
```json
{
  "accessToken": "facebook-access-token-from-frontend"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJI...",
  "user": {
    "id": "uuid",
    "email": "user@facebook.com",
    "isAdmin": false
  }
}
```

---

### ?? Authorized (wymaga JWT tokenu)

**Header:**
```
Authorization: Bearer eyJhbGciOiJI...
```

#### **GET** `/api/users/me`
Pobierz profil zalogowanego u¿ytkownika.

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "personalityType": "balanced",
  "isAdmin": false
}
```

---

#### **PUT** `/api/users/me`
Aktualizuj profil zalogowanego u¿ytkownika.

**Request Body:**
```json
{
  "personalityType": "supportive"  // nullable
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "personalityType": "supportive",
  "isAdmin": false
}
```

---

### ?? Admin Only (wymaga roli `admin`)

#### **GET** `/api/admin/users`
Lista wszystkich u¿ytkowników.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "isPremium": false,
    "coinsBalance": 100,
    "streakCount": 5,
    "isAdmin": false
  },
  ...
]
```

---

#### **DELETE** `/api/admin/users/{id}`
Usuñ u¿ytkownika (soft delete).

**Response 204:** No Content (sukces)

**?? Uwaga:** Nie mo¿na usun¹æ u¿ytkownika z rol¹ admin!

---

#### **GET** `/api/admin/logs`
Pobierz najnowszy plik logów.

**Response 200:**
```json
{
  "fileName": "log-2025-01-31.txt",
  "content": "2025-01-31 19:55:00 [INF] Application started...\n..."
}
```

---

## 8. Modele Danych

### User (Domain/User.cs)

```csharp
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Avatar { get; set; }
    public int StreakCount { get; set; }
    public bool StreakActive { get; set; }
    public int CoinsBalance { get; set; }
    public bool IsPremium { get; set; }
    
    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    
    // Not mapped (tylko w pamiêci)
    [NotMapped]
    public bool IsAdmin { get; set; }
    [NotMapped]
    public string PersonalityType { get; set; }
    [NotMapped]
    public string Provider { get; set; }
}
```

### Role (Domain/Role.cs)

```csharp
public class Role
{
    public Guid Id { get; set; }
    public string Name { get; set; }  // user, admin, specialist
    public string? Description { get; set; }
    
    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UserRole  // Junction table
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### PersonalityProfile (Domain/PersonalityProfile.cs)

```csharp
public class PersonalityProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PersonalityType { get; set; }  // supportive, balanced, direct
    public string? Traits { get; set; }  // JSON
    
    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public User? User { get; set; }
}
```

---

## 9. Serwisy

### TokenService (Services/TokenService.cs)

**Odpowiedzialnoœæ:** Generowanie JWT tokenów.

**Metody:**
- `GenerateToken(User user): string`
  - Tworzy JWT token z claims
  - Dodaje role z bazy danych
  - Wa¿noœæ: 24h

**Zale¿noœci:**
- `IConfiguration` - klucz JWT
- `AppDbContext` - pobieranie ról

---

### OAuthService (Services/OAuthService.cs)

**Odpowiedzialnoœæ:** Autoryzacja przez Google i Facebook.

**Metody:**
- `AuthenticateWithGoogleAsync(string idToken): Task<User?>`
  - Waliduje ID Token przez Google API
  - Tworzy u¿ytkownika jeœli nie istnieje
  - Przypisuje domyœln¹ rolê "user"
  - Zwraca u¿ytkownika

- `AuthenticateWithFacebookAsync(string accessToken): Task<User?>`
  - Waliduje Access Token przez Facebook Graph API
  - Pobiera dane u¿ytkownika
  - Tworzy u¿ytkownika jeœli nie istnieje
  - Przypisuje domyœln¹ rolê "user"
  - Zwraca u¿ytkownika

**Zale¿noœci:**
- `AppDbContext` - operacje na bazie
- `IConfiguration` - credentials OAuth
- `HttpClient` - zapytania do API

---

## 10. Middleware

### ErrorHandlingMiddleware (Middleware/ErrorHandlingMiddleware.cs)

**Odpowiedzialnoœæ:** Globalna obs³uga nieobs³u¿onych wyj¹tków.

**Dzia³anie:**
1. Przechwytuje wszystkie wyj¹tki w pipeline
2. Loguje b³¹d przez `ILogger`
3. Zwraca zunifikowan¹ odpowiedŸ JSON:

```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "detailed": "Exception message..."
}
```

**Rejestracja w Program.cs:**
```csharp
app.UseMiddleware<ErrorHandlingMiddleware>();
```

?? Musi byæ **przed** innymi middleware'ami!

---

## 11. Logowanie

### Serilog

Aplikacja u¿ywa **Serilog** do strukturalnego logowania.

**Konfiguracja:**
```csharp
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
```

**Lokalizacja logów:** `Logs/log-YYYY-MM-DD.txt`

**Przyk³ad loga:**
```
2025-01-31 19:55:00 [INF] Application started
2025-01-31 19:55:05 [INF] User admin@local logged in via local
2025-01-31 19:55:10 [ERR] Error authenticating with Google: Invalid token
```

**Poziomy logowania:**
- `LogInformation` - normalne operacje
- `LogWarning` - potencjalne problemy
- `LogError` - b³êdy wymagaj¹ce uwagi

**Dostêp do logów:**
- Administrator: `GET /api/admin/logs`
- Bezpoœrednio: pliki w folderze `Logs/`

---

### Przydatne komendy:

```bash
# Restore packages
dotnet restore

# Build project
dotnet build

# Run project
dotnet run

# Clean
dotnet clean

# Check EF Core migrations
dotnet ef migrations list

# Create migration
dotnet ef migrations add <MigrationName>

# Update database
dotnet ef database update
```

---

**Ostatnia aktualizacja:** 31.01.2025  
**Wersja dokumentacji:** 1.0  
**Wersja API:** v1
