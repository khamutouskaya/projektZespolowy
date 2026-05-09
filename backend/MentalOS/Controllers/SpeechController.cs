using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/speech")]
    public class SpeechController : ControllerBase
    {
        private readonly ISpeechService _speechService;
   private readonly ILogger<SpeechController> _logger;

        public SpeechController(ISpeechService speechService, ILogger<SpeechController> logger)
        {
  _speechService = speechService;
            _logger = logger;
        }

        [HttpPost("transcribe")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Transcribe(
         [FromForm] TranslateRequestDto request,
       CancellationToken cancellationToken)
 {
          try
    {
     _logger.LogInformation("Transcribe endpoint wywołany");

      if (request == null)
             {
              _logger.LogWarning("Request jest null");
           return BadRequest(new { Success = false, Error = "Request is null" });
           }

           if (request.File == null)
            {
     _logger.LogWarning("File jest null");
           return BadRequest(new { Success = false, Error = "File is required" });
      }

         _logger.LogInformation("Otrzymano plik: {FileName}, Rozmiar: {FileSize}, ContentType: {ContentType}",
     request.File.FileName, request.File.Length, request.File.ContentType);

      var result = await _speechService.TranscribeAsync(
      request.File,
      request.language,
cancellationToken);

      if (!result.Success)
           {
        _logger.LogWarning("Transkrypcja nie powiodła się: {Error}", result.Error);
          return BadRequest(result);
            }

      _logger.LogInformation("Transkrypcja zakończona pomyślnie");
  return Ok(result);
            }
       catch (Exception ex)
            {
       _logger.LogError(ex, "Błąd podczas przetwarzania żądania transkrypcji");
      return StatusCode(500, new { Success = false, Error = $"Internal server error: {ex.Message}" });
        }
}

    }

    public class TranslateRequestDto
    {
        public IFormFile File { get; set; } = null!;
        public string? language { get; set; }
    }
}
