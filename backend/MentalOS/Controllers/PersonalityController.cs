using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.DTOs;
using MentalOS.Services.Interfaces;
using MentalOS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/personality")]
    [Authorize]
    public class PersonalityController : ControllerBase
    {
        private readonly PersonalityService _service;
        private readonly IQuestionProvider _provider;
        private readonly AppDbContext _context;

        public PersonalityController(
            PersonalityService service,
            IQuestionProvider provider,
            AppDbContext context)
        {
            _service = service;
            _provider = provider;
            _context = context;
        }

        private Guid? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return claim != null && Guid.TryParse(claim, out var id) ? id : null;
        }

        [HttpGet("questions")]
        public IActionResult GetQuestions()
        {
            return Ok(_provider.GetQuestions());
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.PersonalityProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId.Value);

            if (profile == null) return NotFound();

            var scores = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, double>>(
                profile.Traits ?? "{}",
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return Ok(scores);
        }

        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitTestDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var scores = _service.Calculate(dto.Answers);

            var dominantTrait = scores.OrderByDescending(s => s.Value).First().Key;
            var traitsJson = System.Text.Json.JsonSerializer.Serialize(scores);

            var profile = await _context.PersonalityProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId.Value);

            if (profile == null)
            {
                profile = new PersonalityProfile
                {
                    UserId = userId.Value,
                    PersonalityType = dominantTrait,
                    Traits = traitsJson,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                _context.PersonalityProfiles.Add(profile);
            }
            else
            {
                profile.PersonalityType = dominantTrait;
                profile.Traits = traitsJson;
                profile.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(scores);
        }
    }
}
