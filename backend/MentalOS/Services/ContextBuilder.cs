using Microsoft.EntityFrameworkCore;
using MentalOS.Data;
using MentalOS.Services.Interfaces;
using System.Text;
using System.Text.RegularExpressions;

namespace MentalOS.Services
{
    public class ContextBuilder : IContextBuilder
    {
        private readonly AppDbContext _db;

        public ContextBuilder(AppDbContext db)
        {
            _db = db;
        }

        public async Task<string> BuildContextAsync(Guid userId)
        {
            var sb = new StringBuilder();

            var now = DateTime.UtcNow;
            var todayStart = now.Date;
            var weekAgo = todayStart.AddDays(-7);

            // -------------------------
            // 1️⃣ JOURNAL (последние записи)
            // -------------------------
            var recentEntries = await _db.JournalEntries
                .Where(x => x.UserId == userId && !x.IsSummary)
                .OrderByDescending(x => x.CreatedAt)
                .Take(3)
                .ToListAsync();

            if (recentEntries.Any())
            {
                sb.AppendLine("Recent journal entries:");

                foreach (var entry in recentEntries)
                {
                    sb.AppendLine($"- {Trim(Anonymize(entry.Content), 120)}");

                    if (!string.IsNullOrEmpty(entry.Emotions))
                        sb.AppendLine($"  emotions: {entry.Emotions}");
                }
            }

            // -------------------------
            // 2️⃣ MOOD ANALYSIS (за неделю)
            // -------------------------
            var weeklyEntries = await _db.JournalEntries
                .Where(x => x.UserId == userId &&
                            x.EntryDate >= weekAgo &&
                            x.MoodScore.HasValue)
                .ToListAsync();

            if (weeklyEntries.Any())
            {
                var avgMood = Math.Round(weeklyEntries.Average(x => x.MoodScore!.Value), 1);

                var emotions = weeklyEntries
                    .Where(x => !string.IsNullOrEmpty(x.Emotions))
                    .SelectMany(x => x.Emotions!.Split(","))
                    .Select(e => e.Trim().ToLower())
                    .GroupBy(e => e)
                    .OrderByDescending(g => g.Count())
                    .Take(3)
                    .Select(g => g.Key);

                sb.AppendLine();
                sb.AppendLine("Emotional state (last 7 days):");
                sb.AppendLine($"- average mood: {avgMood}/10");
                sb.AppendLine($"- dominant emotions: {string.Join(", ", emotions)}");
            }

            // -------------------------
            // 3️⃣ TODAY TASKS
            // -------------------------
            var todayTasks = await _db.PlannerTasks
                .Where(t => t.UserId == userId &&
                            t.TaskDate >= todayStart &&
                            t.TaskDate < todayStart.AddDays(1))
                .OrderBy(t => t.TaskDate)
                .Take(5)
                .ToListAsync();

            if (todayTasks.Any())
            {
                sb.AppendLine();
                sb.AppendLine("Today's tasks:");

                foreach (var task in todayTasks)
                {
                    sb.AppendLine($"- {task.Title} ({(task.IsCompleted ? "done" : "pending")})");
                }
            }

            // -------------------------
            // 4️⃣ PRODUCTIVITY SIGNAL
            // -------------------------
            var completedTasks = todayTasks.Count(t => t.IsCompleted);
            var totalTasks = todayTasks.Count;

            if (totalTasks > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Productivity:");
                sb.AppendLine($"- completed {completedTasks}/{totalTasks} tasks today");
            }

            return sb.ToString();
        }

        // ограничение длины текста (очень важно)
        private string Trim(string text, int maxLength)
        {
            if (string.IsNullOrEmpty(text)) return text;

            return text.Length <= maxLength
                ? text
                : text.Substring(0, maxLength) + "...";
        }

        // Anonimizacja danych wrażliwych przed wysłaniem do AI
        private string Anonymize(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;

            // Ukrywanie adresów email
            text = Regex.Replace(text, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[EMAIL_UKRYTY]");

            // Ukrywanie potencjalnych numerów pesel lub numerów telefonów (9-11 cyfr)
            text = Regex.Replace(text, @"\b\d{9,11}\b", "[NUMER_UKRYTY]");

            return text;
        }
    }
}