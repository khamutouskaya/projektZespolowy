using MentalOS.DTOs.ChatDTOs;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace MentalOS.Services.Interfaces
{
    public class OpenAiChatService : IAiChatService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public OpenAiChatService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> GetResponseAsync(List<object> messages)
        {
            var apiKey = _config["OpenAI:ApiKey"];

            var body = new
            {
                model = "gpt-4.1-mini",
                messages = messages
            };

            var json = JsonSerializer.Serialize(body);

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.openai.com/v1/chat/completions"
            );

            request.Headers.Authorization = 
                new AuthenticationHeaderValue("Bearer", apiKey);

            request.Content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(request);

            if(!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"OpenAI API error: {response.StatusCode}, {errorContent}");
            }
            var content = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(content);

            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString()!;
        }
    }
}
