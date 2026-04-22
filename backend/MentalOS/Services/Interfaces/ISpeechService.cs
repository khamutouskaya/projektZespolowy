using Microsoft.AspNetCore.Http;
using MentalOS.DTOs;

namespace MentalOS.Services.Interfaces
{
    public interface ISpeechService
    {
        Task<TranscriptionResultDto> TranscribeAsync(IFormFile file, string? language, CancellationToken cancellationToken);
    }
}
