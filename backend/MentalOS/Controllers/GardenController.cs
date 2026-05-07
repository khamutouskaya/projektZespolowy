using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GardenController : ControllerBase
    {
        private readonly IGardenService _gardenService;

        public GardenController(IGardenService gardenService)
        {
            _gardenService = gardenService;
        }

        [HttpGet]
        public async Task<IActionResult> GetGarden()
        {
            var userId = GetUserId();

            var result = await _gardenService.GetGardenStatusAsync(userId);

            return Ok(result);
        }

        [HttpPost("plant")]
        public async Task<IActionResult> PlantTree()
        {
            var userId = GetUserId();

            await _gardenService.PlantTreeAsync(userId);

            return Ok();
        }

        [HttpPost("harvest/{gardenBedId}")]
        public async Task<IActionResult> HarvestTree(Guid gardenBedId)
        {
            var userId = GetUserId();

            await _gardenService.HarvestTreeAsync(userId, gardenBedId);

            return Ok();
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Invalid user");

            return userId;
        }
    }
}