using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/speech")]
    public class SpeechController : ControllerBase
    {
        private readonly ISpeechService _speechService;

        public SpeechController(ISpeechService speechService)
        {
            _speechService = speechService;
        }

        [HttpPost("transcribe")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Transcribe(
            [FromForm] TranslateRequestDto request,
            CancellationToken cancellationToken)
        {
            var result = await _speechService.TranscribeAsync(
                request.File,
                request.language,
                cancellationToken);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

    }

    public class TranslateRequestDto
    {
        public IFormFile File { get; set; } = null!;
        public string? language { get; set; }
    }
}
