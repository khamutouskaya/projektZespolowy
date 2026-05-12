using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.DTOs.JournalDTOs;
using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    /// <summary>
    /// Endpointy dla mechanizmów dziennika - pobieranie, dodawanie, edycja i usuwanie wpisów z dziennika
    /// </summary>
    [ApiController]
    [Route("api/journal")]
    [Authorize]
    public class JournalController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAiChatService _aiChatService;

        public JournalController(AppDbContext context, IAiChatService aiChatService)
        {
            _context = context;
            _aiChatService = aiChatService;
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return null;
        }

        [HttpGet]
        public async Task<IActionResult> GetEntries()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var entries = await _context.JournalEntries
                .Where(j => j.UserId == userId)
                .OrderByDescending(j => j.CreatedAt)
                .Select(j => new JournalEntryDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Content = j.Content,
                    Preview = j.Preview,
                    MoodScore = j.MoodScore,
                    Emotions = j.Emotions,
                    IsSummary = j.IsSummary,
                    EntryDate = j.EntryDate,
                    CreatedAt = j.CreatedAt,
                    UpdatedAt = j.UpdatedAt
                })
                .ToListAsync();

            return Ok(entries);
        }

        [HttpGet("date-range")]
        public async Task<IActionResult> GetEntriesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var startOfDay = startDate.Date.ToUniversalTime();
            var endOfDay = endDate.Date.ToUniversalTime().AddDays(1);

            var entries = await _context.JournalEntries
                .Where(j => j.UserId == userId && j.EntryDate >= startOfDay && j.EntryDate < endOfDay)
                .OrderByDescending(j => j.EntryDate)
                .Select(j => new JournalEntryDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Content = j.Content,
                    Preview = j.Preview,
                    MoodScore = j.MoodScore,
                    Emotions = j.Emotions,
                    IsSummary = j.IsSummary,
                    EntryDate = j.EntryDate,
                    CreatedAt = j.CreatedAt,
                    UpdatedAt = j.UpdatedAt
                })
                .ToListAsync();

            return Ok(entries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEntry(Guid id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var entry = await _context.JournalEntries
                .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

            if (entry == null) return NotFound(new { message = "Journal entry not found" });

            return Ok(new JournalEntryDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Content = entry.Content,
                Preview = entry.Preview,
                MoodScore = entry.MoodScore,
                Emotions = entry.Emotions,
                IsSummary = entry.IsSummary,
                EntryDate = entry.EntryDate,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateEntry([FromBody] CreateJournalEntryDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var entry = new JournalEntry
            {
                UserId = userId.Value,
                Title = dto.Title,
                Content = dto.Content,
                Preview = dto.Preview,
                MoodScore = dto.MoodScore,
                Emotions = dto.Emotions,
                IsSummary = dto.IsSummary,
                EntryDate = dto.EntryDate ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.JournalEntries.Add(entry);

            if (!string.IsNullOrEmpty(dto.Preview) && !dto.IsSummary)
                await TryUpdateStreakAsync(userId.Value);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEntry), new { id = entry.Id }, new JournalEntryDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Content = entry.Content,
                Preview = entry.Preview,
                MoodScore = entry.MoodScore,
                Emotions = entry.Emotions,
                IsSummary = entry.IsSummary,
                EntryDate = entry.EntryDate,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEntry(Guid id, [FromBody] UpdateJournalEntryDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var entry = await _context.JournalEntries
                .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

            if (entry == null) return NotFound(new { message = "Journal entry not found" });

            bool previewNewlySet = string.IsNullOrEmpty(entry.Preview) && !string.IsNullOrEmpty(dto.Preview);

            entry.Title = dto.Title;
            entry.Content = dto.Content;
            entry.Preview = dto.Preview;
            entry.MoodScore = dto.MoodScore;
            entry.Emotions = dto.Emotions;
            if (dto.EntryDate.HasValue) entry.EntryDate = dto.EntryDate.Value;
            entry.UpdatedAt = DateTime.UtcNow;

            if (previewNewlySet && !entry.IsSummary)
                await TryUpdateStreakAsync(userId.Value);

            await _context.SaveChangesAsync();

            return Ok(new JournalEntryDto
            {
                Id = entry.Id,
                Title = entry.Title,
                Content = entry.Content,
                Preview = entry.Preview,
                MoodScore = entry.MoodScore,
                Emotions = entry.Emotions,
                IsSummary = entry.IsSummary,
                EntryDate = entry.EntryDate,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEntry(Guid id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var entry = await _context.JournalEntries
                .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

            if (entry == null) return NotFound(new { message = "Journal entry not found" });

            _context.JournalEntries.Remove(entry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Journal entry deleted successfully" });
        }

        [HttpGet("summary/{date}")]
        public async Task<IActionResult> GetDailySummary(DateTime date)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var startOfDay = date.Date.ToUniversalTime();
            var endOfDay = startOfDay.AddDays(1);

            var dailyEntries = await _context.JournalEntries
                .Where(j => j.UserId == userId && j.EntryDate >= startOfDay && j.EntryDate < endOfDay)
                .OrderBy(j => j.EntryDate)
                .ToListAsync();

            if (!dailyEntries.Any())
            {
                return Ok(new { message = "No entries for this date.", entryCount = 0 });
            }

            var avgMood = dailyEntries.Where(e => e.MoodScore.HasValue).Average(e => e.MoodScore);

            return Ok(new
            {
                date = startOfDay.ToString("yyyy-MM-dd"),
                entryCount = dailyEntries.Count,
                averageMoodScore = avgMood,
                entries = dailyEntries.Select(j => new JournalEntryDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Content = j.Content,
                    MoodScore = j.MoodScore,
                    Emotions = j.Emotions,
                    IsSummary = j.IsSummary,
                    EntryDate = j.EntryDate,
                    CreatedAt = j.CreatedAt,
                    UpdatedAt = j.UpdatedAt
                })
            });
        }

        [HttpPost("daily-summary/generate")]
        public async Task<IActionResult> GenerateDailySummary([FromBody] GenerateSummaryRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var entryDate = request.Date ?? DateTime.UtcNow;
            var startOfDay = entryDate.Date.ToUniversalTime();
            var endOfDay = startOfDay.AddDays(1);
            var lastWeek = startOfDay.AddDays(-7);
            var yesterdayStart = startOfDay.AddDays(-1);
            var yesterdayEnd = startOfDay;

            var personality = await _context.PersonalityProfiles.FirstOrDefaultAsync(p => p.UserId == userId.Value);
            var personalityType = personality?.PersonalityType ?? "Brak określonego typu";

            var todayTasks = await _context.PlannerTasks
                .Where(t => t.UserId == userId.Value && t.TaskDate >= startOfDay && t.TaskDate < endOfDay)
                .ToListAsync();

            var taskDescriptions = todayTasks.Any()
                ? string.Join("; ", todayTasks.Select(t => $"{t.Title} ({(t.IsCompleted ? "Zakończone" : "Niezakończone")})"))
                : "Brak zaplanowanych zadań na ten dzień.";

            var recentEntries = await _context.JournalEntries
                .Where(j => j.UserId == userId.Value && j.EntryDate >= lastWeek && j.EntryDate < startOfDay && j.MoodScore.HasValue)
                .ToListAsync();

            var avgMoodData = recentEntries.Any()
                ? $"Średnia nastroju z ostatnich 7 dni: {Math.Round(recentEntries.Average(e => e.MoodScore!.Value), 1)}/10"
                : "Brak wystarczających historii z ostatnich dni.";

            var systemPrompt = $@"Jesteś asystentem AI w aplikacji dbania o zdrowie psychiczne. Twoim zadaniem jest wygenerować spersonalizowany opis dnia (podsumowanie) na podstawie krótkich odpowiedzi użytkownika.
Zwróć uwagę na następujące konteksty:
- Typ osobowości użytkownika (z onboardingu): {personalityType}
- Zadania zaplanowane na dzisiaj i ich status: {taskDescriptions}
- Ogólny stan emocjonalny (historia nastroju): {avgMoodData}

Twoje zadanie:
Podsumowanie powinno zawierać: interpretację wydarzeń, analizę samopoczucia w kontekście zadań i historii, wykryte emocje dominujące, pochwałę i wsparcie, oraz wskazówki dotyczące poprawy nastroju. Zwróć tekst jako czysty opis dnia z wydzielonymi akapitami.";

            var messages = new List<object>
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = $"Moje odpowiedzi z dzisiaj:\n{request.DailyAnswers}" }
            };

            var aiResponse = await _aiChatService.GetResponseAsync(messages);

            if (string.IsNullOrEmpty(aiResponse))
                return StatusCode(500, new { message = "Failed to generate daily summary." });

            // Find existing entry for today and update its preview instead of creating a new entry
            var existingEntry = await _context.JournalEntries
                .Where(j => j.UserId == userId.Value && !j.IsSummary && j.EntryDate >= startOfDay && j.EntryDate < endOfDay)
                .OrderByDescending(j => j.UpdatedAt)
                .FirstOrDefaultAsync();

            bool alreadyHadPreview = existingEntry != null && !string.IsNullOrEmpty(existingEntry.Preview);

            if (existingEntry != null)
            {
                existingEntry.Preview = aiResponse;
                existingEntry.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                return BadRequest(new { message = "Brak wpisu na dzień dzisiejszy. Najpierw napisz notatkę." });
            }

            if (!alreadyHadPreview)
                await TryUpdateStreakAsync(userId.Value);

            await _context.SaveChangesAsync();

            return Ok(new JournalEntryDto
            {
                Id = existingEntry.Id,
                Title = existingEntry.Title,
                Content = existingEntry.Content,
                Preview = existingEntry.Preview,
                Emotions = existingEntry.Emotions,
                IsSummary = existingEntry.IsSummary,
                EntryDate = existingEntry.EntryDate,
                CreatedAt = existingEntry.CreatedAt,
                UpdatedAt = existingEntry.UpdatedAt
            });
        }

        [HttpPost("daily-summary/generate-text")]
        public async Task<IActionResult> GenerateSummaryText([FromBody] GenerateSummaryRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var entryDate = request.Date ?? DateTime.UtcNow;
            var startOfDay = entryDate.Date.ToUniversalTime();
            var endOfDay = startOfDay.AddDays(1);
            var lastWeek = startOfDay.AddDays(-7);

            var personality = await _context.PersonalityProfiles.FirstOrDefaultAsync(p => p.UserId == userId.Value);
            var personalityContext = BuildPersonalityContext(personality);

            var todayTasks = await _context.PlannerTasks
                .Where(t => t.UserId == userId.Value && t.TaskDate >= startOfDay && t.TaskDate < endOfDay)
                .ToListAsync();

            var taskDescriptions = todayTasks.Any()
                ? string.Join("; ", todayTasks.Select(t => $"{t.Title} ({(t.IsCompleted ? "Zakończone" : "Niezakończone")})"))
                : "Brak zaplanowanych zadań na ten dzień.";

            var recentEntries = await _context.JournalEntries
                .Where(j => j.UserId == userId.Value && j.EntryDate >= lastWeek && j.EntryDate < startOfDay && j.MoodScore.HasValue)
                .ToListAsync();

            var avgMoodData = recentEntries.Any()
                ? $"Średnia nastroju z ostatnich 7 dni: {Math.Round(recentEntries.Average(e => e.MoodScore!.Value), 1)}/10"
                : "Brak wystarczających historii z ostatnich dni.";

            var systemPrompt = $@"Jesteś asystentem AI w aplikacji dbania o zdrowie psychiczne. Twoim zadaniem jest wygenerować spersonalizowany opis dnia (podsumowanie) na podstawie wpisu użytkownika.

{personalityContext}
- Zadania zaplanowane na dzisiaj i ich status: {taskDescriptions}
- Ogólny stan emocjonalny (historia nastroju): {avgMoodData}

Twoje zadanie:
Na podstawie wpisu i profilu osobowości wygeneruj podsumowanie które zawiera:
1. Interpretację przeżytego dnia przez pryzmat osobowości użytkownika
2. Konkretne wskazówki i porady dopasowane do jego cech charakteru
3. Cele lub małe kroki na jutro — realistyczne i dostosowane do jego profilu
4. Wsparcie emocjonalne i pochwałę — w tonie odpowiednim do osobowości
Zwróć czysty tekst z wydzielonymi akapitami, bez nagłówków markdown.";

            var messages = new List<object>
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = $"Moje odpowiedzi z dzisiaj:\n{request.DailyAnswers}" }
            };

            var aiResponse = await _aiChatService.GetResponseAsync(messages);

            if (string.IsNullOrEmpty(aiResponse))
                return StatusCode(500, new { message = "Failed to generate daily summary." });

            return Ok(new { text = aiResponse });
        }

        private async Task TryUpdateStreakAsync(Guid userId)
        {
            var today = DateTime.UtcNow.Date;
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            bool recentlyCompleted = user.LastActivityDate.HasValue &&
                (DateTime.UtcNow - user.LastActivityDate.Value).TotalMinutes < 2;
            if (recentlyCompleted) return;

            var startOfDay = today;
            var endOfDay = today.AddDays(1);

            bool hasContent = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId && !j.IsSummary
                            && !string.IsNullOrEmpty(j.Content)
                            && j.EntryDate >= startOfDay && j.EntryDate < endOfDay);

            bool hasPreview = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId && !j.IsSummary
                            && !string.IsNullOrEmpty(j.Preview)
                            && j.EntryDate >= startOfDay && j.EntryDate < endOfDay);

            if (!hasContent || !hasPreview) return;

            if (user.LastActivityDate.HasValue &&
                (DateTime.UtcNow - user.LastActivityDate.Value).TotalMinutes < 30)
                user.StreakCount += 1;
            else
                user.StreakCount = 1;

            user.StreakActive = true;
            user.LastActivityDate = DateTime.UtcNow;
            user.HasPendingFruit = true;
            user.CoinsBalance += user.StreakCount * 5;
        }

        private static string BuildPersonalityContext(MentalOS.Domain.PersonalityProfile? personality)
        {
            if (personality == null)
                return "- Profil osobowości użytkownika: nieznany.";

            Dictionary<string, double>? ocean = null;
            try
            {
                ocean = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, double>>(
                    personality.Traits ?? "{}",
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch { }

            var traitNames = new Dictionary<string, string>
            {
                ["O"] = "Otwartość (ciekawość, kreatywność, otwartość na nowe doświadczenia)",
                ["C"] = "Sumienność (zorganizowanie, samodyscyplina, wytrwałość)",
                ["E"] = "Ekstrawersja (towarzyskość, energiczność, asertywność)",
                ["A"] = "Ugodowość (empatia, współpraca, życzliwość)",
                ["N"] = "Neurotyczność (reaktywność emocjonalna, podatność na stres)",
            };

            var levelLabel = (double v) => v >= 4.0 ? "wysoka" : v >= 3.0 ? "średnia" : "niska";

            if (ocean == null || !ocean.Keys.Any(traitNames.ContainsKey))
                return "- Profil osobowości użytkownika: nieznany (użytkownik nie ukończył testu osobowości).";

            var lines = traitNames
                .Where(t => ocean.ContainsKey(t.Key))
                .Select(t => $"  • {t.Value}: {levelLabel(ocean[t.Key])} ({ocean[t.Key]:F2}/5.00)");

            return $@"- Profil osobowości użytkownika (model Wielkiej Piątki / Big Five):
{string.Join("\n", lines)}
Uwzględnij te cechy przy formułowaniu wskazówek, celów i wsparcia — dostosuj ton i rady do profilu.";
        }

        [HttpPost("ai-entry")]
        public async Task<IActionResult> GenerateAiEntry([FromBody] GenerateAiEntryRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            if (string.IsNullOrWhiteSpace(request.TranscribedText))
                return BadRequest("Przekazany tekst jest pusty.");

            var systemPrompt = @"Jesteś asystentem. Przeanalizuj poniższy zapis przemyśleń użytkownika. Zwróć JSON z następującymi polami:
- title: zwięzły tytuł wpisu,
- content: sformatowany, uporządkowany i zrozumiały tekst na podstawie przemyśleń,
- moodScore: od 1 do 10 (ocena nastroju, gdzie 10 to świetny, 1 to fatalny),
- emotions: nazwy wykrytych emocji po przecinku.
Tylko czysty JSON, bez dodatkowych formatowań markdown, z kluczami po angielsku.";

            var messages = new List<object>
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = request.TranscribedText }
            };

            var aiResponse = await _aiChatService.GetResponseAsync(messages);

            JournalEntryDto? aiParsed = null;
            try
            {
                var cleanJson = aiResponse.Replace("```json", "").Replace("```", "").Trim();
                var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsedData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(cleanJson, options);
                
                aiParsed = new JournalEntryDto
                {
                    Title = parsedData?.ContainsKey("title") == true ? parsedData["title"].ToString() : "Nowy wpis (AI)",
                    Content = parsedData?.ContainsKey("content") == true ? parsedData["content"].ToString() : request.TranscribedText,
                    MoodScore = parsedData?.ContainsKey("moodScore") == true && int.TryParse(parsedData["moodScore"].ToString(), out var ms) ? ms : null,
                    Emotions = parsedData?.ContainsKey("emotions") == true ? parsedData["emotions"].ToString() : null,
                };
            }
            catch
            {
                aiParsed = new JournalEntryDto
                {
                    Title = "Wpis (AI)",
                    Content = request.TranscribedText
                };
            }

            var entryDate = request.EntryDate ?? DateTime.UtcNow;

            var journalEntry = new JournalEntry
            {
                UserId = userId.Value,
                Title = aiParsed.Title,
                Content = aiParsed.Content,
                MoodScore = aiParsed.MoodScore,
                Emotions = aiParsed.Emotions,
                EntryDate = entryDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.JournalEntries.Add(journalEntry);
            await _context.SaveChangesAsync();

            return Ok(new JournalEntryDto
            {
                Id = journalEntry.Id,
                Title = journalEntry.Title,
                Content = journalEntry.Content,
                MoodScore = journalEntry.MoodScore,
                Emotions = journalEntry.Emotions,
                IsSummary = journalEntry.IsSummary,
                EntryDate = journalEntry.EntryDate,
                CreatedAt = journalEntry.CreatedAt,
                UpdatedAt = journalEntry.UpdatedAt
            });
        }
    }
}