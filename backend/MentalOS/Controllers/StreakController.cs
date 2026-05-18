using MentalOS.Data;
using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    /// <summary>
    /// Endpointy serii aktywności — obsługa codziennej aktywności, nagród, owoców i aktualnego stanu serii
    /// </summary>
    [ApiController]
    [Route("api/streak")]
    [Authorize]
    public class StreakController : Controller
    {
        private readonly IStreakService _streakService;

            private readonly AppDbContext _context;

        public StreakController(IStreakService streakService, AppDbContext context)
        {
            _streakService = streakService;
            _context = context;
        }

        private Guid GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new Exception("User ID not found in token");

            return Guid.Parse(userId);
        }

        [HttpPost("daily")]
        public async Task<IActionResult> HandleDailyActivity()
        {
            var userId = GetUserId();

            await _streakService.HandleDailyActivity(userId);

            return Ok(new { message = "Streak updated" });
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add(int amount, string action)
        {
            var userId = GetUserId();

            await _streakService.Add(userId, amount, action);

            return Ok(new { message = "Coins added" });
        }

        //[HttpPost("spend")]
        //public async Task<IActionResult> Spend(int amount, string action)
        //{
        //    var userId = GetUserId();

        //    await _streakService.Spend(userId, amount, action);

        //    return Ok(new { message = "Coins spent" });
        //}

        //[HttpGet("balance")]
        //public async Task<IActionResult> GetBalance()
        //{
        //    var userId = GetUserId();

        //    var balance = await _streakService.GetBalance(userId);

        //    return Ok(new { balance });
        //}

        [HttpGet("daily-status")]
        public async Task<IActionResult> GetDailyStatus()
        {
            var userId = GetUserId();
            var startOfDay = DateTime.UtcNow.Date;
            var endOfDay = startOfDay.AddDays(1);

            var hasJournalEntry = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId && !j.IsSummary
                            && j.EntryDate >= startOfDay && j.EntryDate < endOfDay);

            // Podsumowanie to: wpis wygenerowany przez AI (IsSummary=true)
            //              LUB zwykły wpis z niepustym Preview napisanym przez użytkownika
            var hasDaySummary = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId
                            && (j.IsSummary || (j.Preview != null && j.Preview != ""))
                            && j.EntryDate >= startOfDay && j.EntryDate < endOfDay);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            var fruitsBalance = user?.FruitsBalance ?? 0;
            var hasPendingFruit = user?.HasPendingFruit ?? false;
            var streakCount = user?.StreakCount ?? 0;
            var coinsBalance = user?.CoinsBalance ?? 0;

            var progress = (hasJournalEntry ? 1 : 0) + (hasDaySummary ? 1 : 0);

            var hasDailyFruitUsed = await _context.StreakHistories
                .AnyAsync(sh => sh.UserId == userId
                             && sh.Action == "fruit_action"
                             && sh.Date == startOfDay);

            var hasDailyRewardClaimed = await _context.StreakHistories
                .AnyAsync(sh => sh.UserId == userId
                             && sh.Action == "daily_reward"
                             && sh.Date == startOfDay);

            return Ok(new { hasJournalEntry, hasDaySummary, progress, fruitsBalance, hasPendingFruit, streakCount, coinsBalance, hasDailyFruitUsed, hasDailyRewardClaimed });
        }

        [HttpPost("claim-fruit")]
        public async Task<IActionResult> ClaimFruit()
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return Unauthorized();
            if (!user.HasPendingFruit) return BadRequest(new { message = "No pending fruit" });

            user.FruitsBalance += 1;
            user.HasPendingFruit = false;
            await _context.SaveChangesAsync();

            return Ok(new { fruitsBalance = user.FruitsBalance });
        }

        [HttpPost("claim-daily-reward")]
        public async Task<IActionResult> ClaimDailyReward([FromQuery] string rewardType)
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return Unauthorized();

            var startOfDay = DateTime.UtcNow.Date;
            var endOfDay = startOfDay.AddDays(1);

            var hasJournalEntry = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId && !j.IsSummary
                            && j.EntryDate >= startOfDay && j.EntryDate < endOfDay);

            if (!hasJournalEntry)
                return BadRequest(new { message = "No journal entry today" });

            var alreadyClaimed = await _context.StreakHistories
                .AnyAsync(sh => sh.UserId == userId
                             && sh.Action == "daily_reward"
                             && sh.Date == startOfDay);

            if (alreadyClaimed)
                return BadRequest(new { message = "Already claimed today" });

            if (rewardType == "fruit")
            {
                user.FruitsBalance += 1;
            }
            else if (rewardType == "coins")
            {
                user.CoinsBalance += 10;
            }
            else
            {
                return BadRequest(new { message = "Invalid reward type" });
            }

            user.HasPendingFruit = false;

            _context.StreakHistories.Add(new Domain.StreakHistory
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Date = startOfDay,
                StreakValue = user.StreakCount,
                BalanceAfter = user.CoinsBalance,
                Action = "daily_reward",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { coinsBalance = user.CoinsBalance, fruitsBalance = user.FruitsBalance });
        }

        [HttpPost("debug/add-fruits")]
        public async Task<IActionResult> DebugAddFruits([FromQuery] int amount = 5)
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return Unauthorized();
            user.FruitsBalance += amount;
            await _context.SaveChangesAsync();
            return Ok(new { fruitsBalance = user.FruitsBalance });
        }

        [HttpGet("current-streak")]
        public async Task<IActionResult> GetStreakCount()
        {
            var userId = GetUserId();

            var streak = await _streakService.GetCurrentStreak(userId);

            return Ok(new { streak });
        }
    }
}
