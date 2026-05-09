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
        // change payment controller, 
        // isActive change, while it using and isActive - false while it dont

        // password checker 

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
        public async Task<IActionResult> Buy([FromQuery] string itemId, [FromBody] MentalOS.DTOs.CreateShopItemDto itemDto)
        {
            if (string.IsNullOrEmpty(itemId))
                return BadRequest("Invalid itemId");

            var userId = GetUserId();

            ShopItem targetItem = null;
            if (Guid.TryParse(itemId, out var parsedGuid))
            {
                targetItem = await _context.Set<ShopItem>().FirstOrDefaultAsync(i => i.Id == parsedGuid);
            }
            if (targetItem == null)
            {
                targetItem = await _context.Set<ShopItem>().FirstOrDefaultAsync(i => i.FrontendAccesoriesId == itemId);
            }

            // Auto-create item in backend to support frontend mocks silently
            if (targetItem == null && itemDto != null && !string.IsNullOrEmpty(itemDto.Name))
            {
                targetItem = new ShopItem
                {
                    FrontendAccesoriesId = itemId,
                    Name = itemDto.Name,
                    Description = itemDto.Description ?? "",
                    Price = itemDto.Price,
                    Type = itemDto.Type ?? "accessory"
                };
                _context.Set<ShopItem>().Add(targetItem);
                await _context.SaveChangesAsync();
            }

            if (targetItem == null)
                return NotFound(new { error = "Item not found in backend DB" });

            try
            {
                await _shopService.PurchaseTrasaction(userId, targetItem.Id);
                await _shopService.EquipItem(userId, targetItem.Id);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }

            return Ok(new { message = "Purchased successfully" });
        }

        [HttpGet("purchase-history")]
        public async Task<IActionResult> GetPurchaseHistory()
        {
            var userId = GetUserId();
            var transactions = await _context.CoinTransactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            return Ok(transactions);
        }

        [HttpGet("my-items")]
        public async Task<IActionResult> GetUserItems()
        {
            var userId = GetUserId();

            var result = await _context.Set<UserItem>()
                .Where(ui => ui.UserId == userId)
                .Join(_context.Set<ShopItem>(), ui => ui.ShopItemId, si => si.Id, (ui, si) => new
                {
                    UserItemId = ui.Id,
                    ShopItemId = ui.ShopItemId,
                    FrontendAccesoriesId = si.FrontendAccesoriesId,
                    IsActive = ui.IsActive,
                    PurchasedAt = ui.PurchasedAt
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpPost("equip-item")]
        public async Task<IActionResult> EquipItem([FromQuery] string itemId)
        {
            if (string.IsNullOrEmpty(itemId))
                return BadRequest("Invalid itemId");

            var userId = GetUserId();

            Guid parsedGuid = Guid.Empty;
            if (Guid.TryParse(itemId, out var parsed))
            {
                parsedGuid = parsed;
            }
            else
            {
                var shopItem = await _context.Set<ShopItem>().FirstOrDefaultAsync(i => i.FrontendAccesoriesId == itemId);
                if (shopItem != null) parsedGuid = shopItem.Id;
            }

            if (parsedGuid == Guid.Empty)
                return NotFound("Item not found");

            try
            {
                await _shopService.EquipItem(userId, parsedGuid);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }

            return Ok();
        }

        [HttpPost("unequip-item")]
        public async Task<IActionResult> UnequipItem([FromQuery] string itemId)
        {
            if (string.IsNullOrEmpty(itemId))
                return BadRequest("Invalid itemId");

            var userId = GetUserId();

            Guid parsedGuid = Guid.Empty;
            if (Guid.TryParse(itemId, out var parsed))
            {
                parsedGuid = parsed;
            }
            else
            {
                var shopItem = await _context.Set<ShopItem>().FirstOrDefaultAsync(i => i.FrontendAccesoriesId == itemId);
                if (shopItem != null) parsedGuid = shopItem.Id;
            }

            if (parsedGuid == Guid.Empty)
                return NotFound("Item not found");

            try
            {
                await _shopService.UnequipItem(userId, parsedGuid);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }

            return Ok();
        }
    }
}