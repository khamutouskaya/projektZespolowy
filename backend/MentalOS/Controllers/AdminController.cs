using MentalOS.Data;
using MentalOS.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MentalOS.DTOs;

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
            //user.DeletedAt = DateTime.UtcNow;
            //await _context.SaveChangesAsync();


            _context.Users.Remove(user);
            await _context.SaveChangesAsync(); 

            return NoContent();
        }

        [HttpGet("logs")]
        public IActionResult GetLogs([FromQuery] int lines = 100)
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

            try
            {
                using var fileStream = new FileStream(latestLog, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                using var streamReader = new StreamReader(fileStream);

                var allLines = new List<string>();
                string? line;

                while ((line = streamReader.ReadLine()) != null)
                {
                    allLines.Add(line);
                }

                var lastLines = allLines.TakeLast(Math.Min(lines, allLines.Count)).ToArray();
                var logContent = string.Join(Environment.NewLine, lastLines);

                return Ok(new
                {
                    fileName = Path.GetFileName(latestLog),
                    totalLines = allLines.Count,
                    displayedLines = lastLines.Length,
                    content = logContent
                });
            }
            catch (IOException ex)
            {
                return StatusCode(500, new { message = "Error reading log file", error = ex.Message });
            }
        }


        [HttpPost("add-item")]
        public async Task<IActionResult> AddItem([FromBody] CreateShopItemDto dto)
        {

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Name is required");

            if (dto.Price < 0)
                return BadRequest("Price must be >= 0");

            var item = new ShopItem
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Type = dto.Type,
                Price = dto.Price
            };

            _context.Set<ShopItem>().Add(item);

            await _context.SaveChangesAsync();

            return Ok(item);
        }
    }
}
