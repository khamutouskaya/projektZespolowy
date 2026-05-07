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

            var today = DateTime.UtcNow.Date;

            var lastJournalActivity = await _context.JournalEntries
                .Where(j => j.UserId == userId)
                .OrderByDescending(j => j.CreatedAt)
                .Select(j => j.CreatedAt.Date)
                .FirstOrDefaultAsync();

            var lastPlannerActivity = await _context.PlannerTasks
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => p.CreatedAt.Date)
                .FirstOrDefaultAsync();

            bool isDailyActivityDone =
                lastJournalActivity == today &&
                lastPlannerActivity == today;

            if (isDailyActivityDone)
            {
                if (user.LastActivityDate.HasValue && user.LastActivityDate.Value.Date == today)
                    return;


                await AddInternal(user, 1, "daily");

                user.LastActivityDate = today;
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
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            CheckStreak(userId).Wait();

            return user.StreakCount;
        }

        private async Task AddInternal(User user, int change, string action)
        {
            var newStreak = user.StreakCount + change;
            var newBalance = user.CoinsBalance + user.StreakCount;

            if (newStreak < 0 || newBalance < 0)
                throw new Exception("Streak and balance cannot be negative");
            user.StreakCount = newStreak;
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

            var lastStreakUpdates = await _context.StreakHistories
                .Where(sh => sh.CreatedAt.Date == today || sh.CreatedAt.Date == yesterday)
                .FirstOrDefaultAsync();

            if (lastStreakUpdates == null)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    throw new Exception("User not found");

                AddInternal(user, 0, "streak losted");

                await _context.SaveChangesAsync();
            }
        }
    }
}
