using MentalOS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/assistant")]
    [Authorize]
    public class AssistantController : ControllerBase
    {
        private readonly AssistantService _assistantService = new();

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AssistantChatRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Message is required." });
            }

            var reply = await _assistantService.GenerateReplyAsync(request.Message, cancellationToken);

            return Ok(new AssistantChatResponse(reply));
        }
    }

    public record AssistantChatRequest(string Message);
    public record AssistantChatResponse(string Reply);
}
