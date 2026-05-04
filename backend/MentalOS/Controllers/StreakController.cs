using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/streak")]
    [Authorize]
    public class StreakController : Controller
    {
        private readonly IStreakService _streakService;

        public StreakController(IStreakService streakService)
        {
            _streakService = streakService;
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

        [HttpPost("spend")]
        public async Task<IActionResult> Spend(int amount, string action)
        {
            var userId = GetUserId();

            await _streakService.Spend(userId, amount, action);

            return Ok(new { message = "Coins spent" });
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            var userId = GetUserId();

            var balance = await _streakService.GetBalance(userId);

            return Ok(new { balance });
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetStreakCount()
        {
            var userId = GetUserId();

            var streak = await _streakService.GetCurrentStreak(userId);

            return Ok(new { streak });
        }
    }
}
