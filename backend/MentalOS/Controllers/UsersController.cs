using MentalOS.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    /// <summary>
    /// Endpointy profilu użytkownika - pobieranie i aktualizacja danych bieżącego użytkownika
    /// </summary>
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new { user.Id, user.Email, user.PersonalityType, user.IsAdmin });
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateUserRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(request.PersonalityType))
            {
                user.PersonalityType = request.PersonalityType;
            }

            await _context.SaveChangesAsync();

            return Ok(new { user.Id, user.Email, user.PersonalityType, user.IsAdmin });
        }
    }

    public record UpdateUserRequest(string? PersonalityType);
}
