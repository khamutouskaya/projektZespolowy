using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.DTOs;
using MentalOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MentalOS.Services
{
    public class WelcomeRewardService : IWelcomeRewardService
    {
        private static readonly Dictionary<string, (int Coins, Func<User, bool> IsGranted, Action<User> MarkGranted)> Rewards =
            new()
            {
                ["note"]  = (10, u => u.HasReceivedNoteReward,  u => u.HasReceivedNoteReward  = true),
                ["task"]  = (5,  u => u.HasReceivedTaskReward,  u => u.HasReceivedTaskReward  = true),
                ["video"] = (10, u => u.HasReceivedVideoReward, u => u.HasReceivedVideoReward = true),
                ["quiz"]  = (50, u => u.HasReceivedQuizReward,  u => u.HasReceivedQuizReward  = true),
            };

        private readonly AppDbContext _context;

        public WelcomeRewardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<WelcomeRewardDto?> TryGrant(Guid userId, string rewardType)
        {
            if (!Rewards.TryGetValue(rewardType, out var reward))
                return null;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return null;

            if (reward.IsGranted(user))
                return null;

            reward.MarkGranted(user);
            user.CoinsBalance += reward.Coins;

            _context.CoinTransactions.Add(new CoinTransaction
            {
                UserId = userId,
                Amount = reward.Coins,
                Reason = $"welcome_reward_{rewardType}",
                Type = "income",
                BalanceAfter = user.CoinsBalance,
                CreatedAt = DateTime.UtcNow,
            });

            await _context.SaveChangesAsync();

            return new WelcomeRewardDto
            {
                Granted = true,
                CoinsAwarded = reward.Coins,
                RewardType = rewardType,
            };
        }
    }
}
