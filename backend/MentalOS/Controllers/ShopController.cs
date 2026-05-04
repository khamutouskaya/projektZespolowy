using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{

    [ApiController]
    [Route("api/shop")]
    [Authorize]
    public class ShopController : ControllerBase
    {
        // add endpoint for coin_transactions, balance cheack, change payment controller, 
        // split coin_balnce and streak -> two diffrent values, adding coins after day, adding streak amount. 
        // add logic for streak (adding amount to streak per a day, saving streak for 2 days (pausing), on day_change event)  + check s
        // isActive change, while it using and isActive - false while it dont


        // password chaker 

        private readonly IShopService _shopService;
        private readonly AppDbContext _context;

        public ShopController(IShopService shopService, AppDbContext context)
        {
            _shopService = shopService;
            _context = context;
        }

        private Guid GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new Exception("User ID not found in token");

            return Guid.Parse(userId);
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetItems()
        {
            var items = await _shopService.GetAvailableShopItems();
            return Ok(items);
        }

        [HttpPost("buy")]
        public async Task<IActionResult> Buy([FromQuery] Guid itemId)
        {
            if (itemId == Guid.Empty)
                return BadRequest("Invalid itemId");

            var userId = GetUserId();

            var exists = await _context.Set<ShopItem>()
                .AnyAsync(i => i.Id == itemId);

            if (!exists)
                return NotFound("Item not found");

            try
            {
                await _shopService.PurchaseTrasaction(userId, itemId);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }

            return Ok(new { message = "Purchased successfully" });
        }

        [HttpGet("my-items")]
        public async Task<IActionResult> GetUserItems()
        {
            var userId = GetUserId();

            var items = await _shopService.GetUserItems(userId);

            return Ok(items);
        }

        
    }
}