using MentalOS.DTOs;
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
        public async Task<ActionResult<GardenStatusDto>> GetGarden()
        {
            var userId = GetUserId();

            var result = await _gardenService.GetGardenStatusAsync(userId);

            return Ok(result);
        }

        [HttpPost("plant/{gardenBedId}")]
        public async Task<IActionResult> PlantTree(Guid gardenBedId)
        {
            var userId = GetUserId();
            try
            {
                await _gardenService.PlantTreeAsync(userId, gardenBedId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("exchange-fruit")]
        public async Task<IActionResult> ExchangeFruit()
        {
            var userId = GetUserId();
            try
            {
                await _gardenService.ExchangeFruitAsync(userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("harvest/{gardenBedId}")]
        public async Task<IActionResult> HarvestTree(Guid gardenBedId)
        {
            var userId = GetUserId();
            try
            {
                var newCoinsBalance = await _gardenService.HarvestTreeAsync(userId, gardenBedId);
                return Ok(new { coinsBalance = newCoinsBalance });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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