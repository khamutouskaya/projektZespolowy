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

        public async Task HandleDailyActivity(Guid userId) // добавить проверку дейликов 
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new Exception("User not found");

            var today = DateTime.UtcNow.Date;

            if (user.LastActivityDate.HasValue && user.LastActivityDate.Value.Date == today)
                return;

            if (user.LastActivityDate.HasValue && user.LastActivityDate.Value.Date == today.AddDays(-1))
                user.CoinsBalance++;
            //else
               // user.CoinsBalance = 1;

            user.LastActivityDate = today;

            await AddInternal(user, 1, "daily");

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

        public async Task Spend(Guid userId, int amount, string action)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new Exception("User not found");

            if (amount <= 0)
                throw new Exception("Amount must be greater than zero");

            if (user.CoinsBalance < amount)
                throw new Exception("Not enough balance");

            await AddInternal(user, -amount, action);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        public async Task<int> GetBalance(Guid userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            return user.CoinsBalance;
        }

        public async Task<int> GetCurrentStreak(Guid userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            return user.CoinsBalance;
        }

        private async Task AddInternal(User user, int change, string action)
        {
            var newBalance = user.CoinsBalance + change;

            if (newBalance < 0)
                throw new Exception("Balance cannot be negative");
            user.CoinsBalance = newBalance;

            _context.StreakHistories.Add(new StreakHistory
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Date = DateTime.UtcNow.Date,
                StreakValue = change,
                BalanceAfter = newBalance,
                Action = action,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
