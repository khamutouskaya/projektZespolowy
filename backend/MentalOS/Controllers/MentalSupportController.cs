using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/mental-support")]
    [Authorize]
    public class MentalSupportController : ControllerBase
    {
        private readonly IWelcomeRewardService _welcomeRewardService;

        public MentalSupportController(IWelcomeRewardService welcomeRewardService)
        {
            _welcomeRewardService = welcomeRewardService;
        }

        private Guid? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return claim != null && Guid.TryParse(claim, out var id) ? id : null;
        }

        /// <summary>
        /// Called by the client when the user watches a video for the first time.
        /// Returns a welcome reward if this is the user's first video watch.
        /// </summary>
        [HttpPost("video-watched")]
        public async Task<IActionResult> VideoWatched()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var welcomeReward = await _welcomeRewardService.TryGrant(userId.Value, "video");

            return Ok(new { welcomeReward });
        }
    }
}
