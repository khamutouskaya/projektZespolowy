using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Security.Claims;

namespace MentalOS.Controllers
{
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

            // Summary = either an AI-generated entry (IsSummary=true)
            //           OR a regular entry with a non-empty Preview written by the user
            var hasDaySummary = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId
                            && (j.IsSummary || (j.Preview != null && j.Preview != ""))
                            && j.EntryDate >= startOfDay && j.EntryDate < endOfDay);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            var fruitsBalance = user?.FruitsBalance ?? 0;
            var hasPendingFruit = user?.HasPendingFruit ?? false;
            var coinsBalance = user?.CoinsBalance ?? 0;

            // Streak = consecutive days the user wrote at least one diary entry (non-summary).
            // If the user hasn't written today yet, show yesterday's streak so it doesn't
            // disappear mid-day before they've had a chance to write.
            var lookbackStart = startOfDay.AddDays(-400);
            var rawEntryDates = await _context.JournalEntries
                .Where(j => j.UserId == userId && !j.IsSummary && j.EntryDate >= lookbackStart)
                .Select(j => j.EntryDate)
                .ToListAsync();
            var entryDateSet = rawEntryDates.Select(d => d.Date).ToHashSet();
            var streakCount = 0;
            var checkDay = entryDateSet.Contains(startOfDay) ? startOfDay : startOfDay.AddDays(-1);
            while (entryDateSet.Contains(checkDay))
            {
                streakCount++;
                checkDay = checkDay.AddDays(-1);
            }

            var progress = (hasJournalEntry ? 1 : 0) + (hasDaySummary ? 1 : 0);

            var hasDailyFruitUsed = await _context.StreakHistories
                .AnyAsync(sh => sh.UserId == userId
                             && sh.Action == "fruit_action"
                             && sh.Date == startOfDay);

            // daily_reward_claimed tracks the new diary-based daily reward (apple or 10 coins)
            var hasDailyRewardClaimed = await _context.StreakHistories
                .AnyAsync(sh => sh.UserId == userId
                             && sh.Action == "daily_reward_claimed"
                             && sh.Date == startOfDay);

            return Ok(new { hasJournalEntry, hasDaySummary, progress, fruitsBalance, hasPendingFruit, streakCount, coinsBalance, hasDailyFruitUsed, hasDailyRewardClaimed });
        }

        [HttpPost("claim-daily-reward")]
        public async Task<IActionResult> ClaimDailyReward([FromQuery] string rewardType)
        {
            if (rewardType != "coins" && rewardType != "fruit")
                return BadRequest(new { message = "Invalid rewardType. Use 'coins' or 'fruit'." });

            var userId = GetUserId();
            var startOfDay = DateTime.UtcNow.Date;
            var endOfDay = startOfDay.AddDays(1);

            // Prevent reclaiming even if diary entry was deleted and recreated
            var alreadyClaimed = await _context.StreakHistories
                .AnyAsync(sh => sh.UserId == userId
                             && sh.Action == "daily_reward_claimed"
                             && sh.Date == startOfDay);
            if (alreadyClaimed)
                return BadRequest(new { message = "Daily reward already claimed today" });

            // Reward only available when user has a diary entry today
            var hasJournalEntry = await _context.JournalEntries
                .AnyAsync(j => j.UserId == userId && !j.IsSummary
                            && j.EntryDate >= startOfDay && j.EntryDate < endOfDay);
            if (!hasJournalEntry)
                return BadRequest(new { message = "No diary entry found for today" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return Unauthorized();

            if (rewardType == "coins")
                user.CoinsBalance += 10;
            else
                user.FruitsBalance += 1;

            user.HasPendingFruit = false;

            _context.StreakHistories.Add(new StreakHistory
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Date = startOfDay,
                StreakValue = user.StreakCount,
                BalanceAfter = user.CoinsBalance,
                Action = "daily_reward_claimed",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { coinsBalance = user.CoinsBalance, fruitsBalance = user.FruitsBalance });
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

        [HttpPost("debug/add-fruits")]
        public async Task<IActionResult> DebugAddFruits([FromQuery] int amount = 5, [FromServices] IWebHostEnvironment env = null!)
        {
            if (!env.IsDevelopment())
                return NotFound();
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
