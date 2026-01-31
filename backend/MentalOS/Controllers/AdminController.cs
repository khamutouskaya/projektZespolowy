using MentalOS.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    /// <summary>
    /// Endpointy tylko dla adminów - zarządzanie użytkownikami i dostęp do logów
    /// </summary>
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new 
                { 
                    u.Id, 
                    u.Email, 
                    u.FirstName,
                    u.LastName,
                    u.IsPremium,
                    u.CoinsBalance,
                    u.StreakCount,
                    IsAdmin = _context.UserRoles
                        .Any(ur => ur.UserId == u.Id && 
                                   _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "admin"))
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Sprawdź czy user ma rolę admin
            var isAdmin = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == id && 
                               _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "admin"));

            if (isAdmin)
            {
                return BadRequest(new { message = "Cannot delete admin user" });
            }

            // Soft delete - ustawia timestamp deleted_at
            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("logs")]
        public IActionResult GetLogs()
        {
            var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");

            if (!Directory.Exists(logDirectory))
            {
                return NotFound(new { message = "No logs found" });
            }

            var logFiles = Directory.GetFiles(logDirectory, "*.txt")
                .OrderByDescending(f => new FileInfo(f).LastWriteTime)
                .Take(1)
                .ToList();

            if (!logFiles.Any())
            {
                return NotFound(new { message = "No log files found" });
            }

            var latestLog = logFiles.First();
            var logContent = System.IO.File.ReadAllText(latestLog);

            return Ok(new { fileName = Path.GetFileName(latestLog), content = logContent });
        }
    }
}
