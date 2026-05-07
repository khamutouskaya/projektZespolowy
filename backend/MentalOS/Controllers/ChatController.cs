using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MentalOS.DTOs;
using MentalOS.Services.Interfaces;
using System.Security.Claims;
using System.Runtime.CompilerServices;
using MentalOS.DTOs.ChatDTOs;
using MentalOS.Services;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IContextBuilder _contextBuilder;

        public ChatController(IChatService chatService, IContextBuilder contextBuilder)
        {
            _contextBuilder = contextBuilder;
            _chatService = chatService;
        }

        [HttpPost("session")]
        public async Task<IActionResult> CreateSession([FromBody] string? title)
        {
            var userId = GetUserId();

            var sessionId = await _chatService.CreateSessionAsync(userId, title);

            return Ok(sessionId);

        }

        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequestDto request)
        {
            var userId = GetUserId();

            var response = await _chatService.SendMessageAsync(userId, request);

            return Ok(response);
        }

        [HttpGet("history/{sessionId}")]
        public async Task<IActionResult> GetHistory(Guid sessionId)
        {
            var history = await _chatService.GetHistoryAsync(sessionId);

            return Ok(history);
        }

        [HttpGet("debug-context")]
        public async Task<IActionResult> GetContext()
        {
            var userId = GetUserId();

            var context = await _contextBuilder.BuildContextAsync(userId);

            return Ok(new { context });
        }

        private Guid GetUserId()
        {
            var idClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null)
                throw new Exception("User ID not found in token");

            return Guid.Parse(idClaim.Value);
        }
    }
}
