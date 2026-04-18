using MentalOS.Data;
using MentalOS.DTOs;
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
        private readonly IWebHostEnvironment _environment;


        public UsersController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "User is unauthorized" });
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var isAdmin = await _context.UserRoles
                        .AnyAsync(ur => ur.UserId == user.Id &&
                        _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "admin"));

            var userDataResponse = new UserDataDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Avatar = user.Avatar,
                StreakCount = user.StreakCount,
                StreakActive = user.StreakActive,
                CoinsBalance = user.CoinsBalance,
                IsPremium = user.IsPremium,
                IsAdmin = isAdmin,
                CreatedAt = user.CreatedAt
            };

            return Ok(userDataResponse);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateUserDataDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "User is unauthorized" });
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.Avatar = request.Avatar ?? user.Avatar;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = user.Id;

            //if (!string.IsNullOrWhiteSpace(request.PersonalityType)) // TODO Personality type, logic and swithcing 
            //{
            //    user.PersonalityType = request.PersonalityType;
            //}

            await _context.SaveChangesAsync();


            var isAdmin = await _context.UserRoles
                        .AnyAsync(ur => ur.UserId == user.Id &&
                        _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "admin"));

            return Ok(new UserDataDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Avatar = user.Avatar,
                StreakCount = user.StreakCount,
                StreakActive = user.StreakActive,
                CoinsBalance = user.CoinsBalance,
                IsPremium = user.IsPremium,
                IsAdmin = isAdmin,
                CreatedAt = user.CreatedAt
            });
        }





        [HttpPost("avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarDto request)
        {
            var avatarFile = request.AvatarFile;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "User is unauthorized" });
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (avatarFile == null || avatarFile.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" }; // TODO add to settings 
            var extension = Path.GetExtension(avatarFile.FileName).ToLowerInvariant();

            if(!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid file type. Allowed types: .jpg, .jpeg, .png, .webp" });
            }

            const long maxSize = 5 * 1024 * 1024; // 5 MB

            if (avatarFile.Length > maxSize)
            {
                return BadRequest(new { message = "File size exceeds the 5 MB limit" });
            }

            var avatarsFolder = Path.Combine(_environment.WebRootPath, "avatars");
            Directory.CreateDirectory(avatarsFolder);

            if(!string.IsNullOrEmpty(user.Avatar))
            {
                var oldFileName = Path.GetFileName(user.Avatar);
                var oldFilePath = Path.Combine(avatarsFolder, oldFileName);

                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            var newFileName = $"{Guid.NewGuid()}{extension}";
            var newFilePath = Path.Combine(avatarsFolder, newFileName);

            using (var stream = new FileStream(newFilePath, FileMode.Create))
            {
                await avatarFile.CopyToAsync(stream);
            }

            user.Avatar = $"/avatars/{newFileName}";
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = user.Id;

            await _context.SaveChangesAsync();

            var avatarUrl = $"{Request.Scheme}://{Request.Host}{user.Avatar}";

            return Ok(new
            {
                message = "Avatar uploaded successfully",
                avatar = user.Avatar,
                avatarUrl
            });
        }

        public record UpdateUserRequest(string? PersonalityType);
    }

    public sealed class UploadAvatarDto
    {
        public IFormFile AvatarFile { get; set; } = null!;
    }
}
