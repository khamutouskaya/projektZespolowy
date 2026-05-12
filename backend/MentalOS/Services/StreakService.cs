using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MentalOS.Services
{
    public class StreakService : IStreakService
    {
        private readonly AppDbContext _context;

        public StreakService(AppDbContext context)
        {
            _context = context;
        }

        public async Task HandleDailyActivity(Guid userId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new Exception("User not found");

            await CheckStreak(userId);

            // Get timestamp of last successful daily streak action
            var lastDailyStreakAt = await _context.StreakHistories
                .Where(sh => sh.UserId == userId && sh.Action == "daily")
                .OrderByDescending(sh => sh.CreatedAt)
                .Select(sh => (DateTime?)sh.CreatedAt)
                .FirstOrDefaultAsync();

            var since = lastDailyStreakAt ?? DateTime.MinValue;

            // Check if there's a new journal entry AND a new summary AFTER the last streak action.
            // Summary counts as: AI-generated entry (IsSummary=true)
            //                 OR regular entry with a non-empty Preview (written by user in DiaryNoteScreen).
            // This allows multiple completions per day (demo mode).
            var hasNewJournalEntry = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId && !j.IsSummary && j.CreatedAt > since);

            var hasNewSummary = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId && j.CreatedAt > since
                            && (j.IsSummary || (j.Preview != null && j.Preview != "")));

            if (hasNewJournalEntry && hasNewSummary)
            {
                await AddInternal(user, 1, "daily");
                user.FruitsBalance += 1;
                user.LastActivityDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        public async Task Add(Guid userId, int amount, string action)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new Exception("User not found");

            await AddInternal(user, amount, action);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        public async Task AddBalance(User user, int amount, string action)
        {
            var newBalance = user.CoinsBalance + amount;

            if (newBalance < 0)
                throw new Exception("Balance cannot be negative");

            user.CoinsBalance = newBalance;

            _context.StreakHistories.Add(new StreakHistory
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Date = DateTime.UtcNow.Date,
                StreakValue = user.StreakCount,
                BalanceAfter = newBalance,
                Action = action,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task<int> GetCurrentStreak(Guid userId)
        {
            await CheckStreak(userId);

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.StreakCount ?? 0;
        }

        private async Task AddInternal(User user, int change, string action)
        {
            var newStreak = user.StreakCount + change;
            // Coins awarded equal to the new streak count (day 1 = 1 coin, day 2 = 2 coins, etc.)
            var newBalance = user.CoinsBalance + newStreak;

            if (newStreak < 0 || newBalance < 0)
                throw new Exception("Streak and balance cannot be negative");

            user.StreakCount = newStreak;
            user.StreakActive = true;
            user.CoinsBalance = newBalance;

            _context.StreakHistories.Add(new StreakHistory
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Date = DateTime.UtcNow.Date,
                StreakValue = newStreak,
                BalanceAfter = newBalance,
                Action = action,
                CreatedAt = DateTime.UtcNow
            });
        }

        public async Task CheckStreak(Guid userId)
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);

            var hasRecentActivity = await _context.StreakHistories
                .AnyAsync(sh => sh.UserId == userId &&
                                (sh.CreatedAt.Date == today || sh.CreatedAt.Date == yesterday));

            if (!hasRecentActivity)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null) return;

                if (user.StreakCount > 0)
                {
                    user.StreakCount = 0;
                    user.StreakActive = false;

                    _context.StreakHistories.Add(new StreakHistory
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Date = today,
                        StreakValue = 0,
                        BalanceAfter = user.CoinsBalance,
                        Action = "streak losted",
                        CreatedAt = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}
