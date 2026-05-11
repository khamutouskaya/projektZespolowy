using System.Net.Http.Headers;
using System.Text.Json;
using MentalOS.DTOs;
using MentalOS.Options;
using MentalOS.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;

namespace MentalOS.Services
{
    public class OpenAiSpeechService : ISpeechService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OpenAiSpeechService> _logger;
        private readonly OpenAiOptions _options;

        private const long MaxFileSize = 25 * 1024 * 1024; // 25 MB

        private static readonly string[] AllowedContentTypes = new[]
        {
            "audio/mpeg",
            "audio/wav",
            "audio/mp4",
            "audio/webm",
            "audio/x-m4a",
            "audio/m4a"
        };


        public OpenAiSpeechService(HttpClient httpClient,
            IOptions<OpenAiOptions> options,
            ILogger<OpenAiSpeechService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;
        }

        public async Task<TranscriptionResultDto> TranscribeAsync(IFormFile file, string? language, CancellationToken cancellationToken)
        {
  try
{
      _logger.LogInformation("TranscribeAsync wywołane dla pliku: {FileName}", file?.FileName ?? "null");

     if (file == null || file.Length == 0)
         {
     _logger.LogWarning("Plik jest null lub pusty");
     return new TranscriptionResultDto
        {
  Success = false,
                Error = "No file uploaded"
      };
     }

          _logger.LogInformation("Rozmiar pliku: {FileSize} bajtów, ContentType: {ContentType}", 
   file.Length, file.ContentType);

                if (file.Length > MaxFileSize)
                {
             _logger.LogWarning("Plik przekracza limit rozmiaru: {FileSize} > {MaxSize}", 
         file.Length, MaxFileSize);
       return new TranscriptionResultDto
     {
              Success = false,
       Error = "File size exceeds the 25 MB limit"
  };
   }

   if (!AllowedContentTypes.Contains(file.ContentType))
    {
          _logger.LogWarning("Nieprawidłowy typ pliku: {ContentType}. Dozwolone: {AllowedTypes}", 
        file.ContentType, string.Join(", ", AllowedContentTypes));
        return new TranscriptionResultDto
             {
       Success = false,
       Error = "Invalid file type. Allowed types: " + string.Join(", ", AllowedContentTypes)
      };
             }

                using var form = new MultipartFormDataContent();

                await using var stream = file.OpenReadStream();

                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

                form.Add(fileContent, "file", file.FileName);

                form.Add(new StringContent(_options.Model), "model");

                if (!string.IsNullOrEmpty(language))
                {
                    form.Add(new StringContent(language), "language");
                }

                var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"https://api.openai.com/v1/audio/transcriptions");

                request.Headers.Authorization =
                    new AuthenticationHeaderValue("Bearer", _options.ApiKey);

                request.Content = form;

                _logger.LogInformation("Sending transcription request to OpenAI for file {FileName}", file.FileName);

                var response = await _httpClient.SendAsync(request, cancellationToken);

                var json = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OpenAI API returned error: {StatusCode} - {Response}", response.StatusCode, json);

                    return new TranscriptionResultDto
                    {
                        Success = false,
                        Error = $"OpenAI error: {json}"
                    };
                }

                var openAiResponse = JsonSerializer.Deserialize<OpenAiResponse>(json);

                return new TranscriptionResultDto
                {
                    Success = true,
                    Transcript = openAiResponse?.Text ?? "",
                    Language = language,
                    FileName = file.FileName,
                    FileSize = file.Length
                };

            }

            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during transcription");

                return new TranscriptionResultDto
                {
                    Success = false,
                    Error = "An error occurred during transcription: " + ex.Message
                };
            }
        }

        private class OpenAiResponse
        {
            [JsonPropertyName("text")]
            public string Text { get; set; } = "";
        }
    }
}