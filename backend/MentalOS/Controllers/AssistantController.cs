using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MentalOS.Services.Interfaces;
using MentalOS.DTOs.ChatDTOs;
using MentalOS.Data;
using Microsoft.EntityFrameworkCore;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/assistant")]
    [Authorize]
    public class AssistantController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly AppDbContext _db;

        public AssistantController(IChatService chatService, AppDbContext db)
        {
            _chatService = chatService;
            _db = db;
        }

        public class AssistantMessageRequest
        {
            public string Message { get; set; } = null!;
            public string? PersonalityHint { get; set; }
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AssistantMessageRequest request)
        {
            var userId = GetUserId();

            var session = await _db.ChatSessions
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            Guid sessionId;
            if (session == null)
            {
                sessionId = await _chatService.CreateSessionAsync(userId, "Default Session");
            }
            else
            {
                sessionId = session.Id;
            }

            var response = await _chatService.SendMessageAsync(userId, new ChatRequestDto
            {
                SessionId = sessionId,
                Message = request.Message,
                PersonalityHint = request.PersonalityHint
            });

            return Ok(new { reply = response.Responce });
        }

        private Guid GetUserId()
        {
            var idClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null) throw new Exception("User ID not found in token");
            return Guid.Parse(idClaim.Value);
        }
    }
}
