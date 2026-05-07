using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using System.Text.Json;

namespace MentalOS.Services
{
    public class JsonQuestionProvider : IQuestionProvider
    {
        private List<PersonalityQuestion> _cache;

        public List<PersonalityQuestion> GetQuestions()
        {
            if (_cache != null)
                return _cache;

            var path = Path.Combine(
                Directory.GetCurrentDirectory(),
                "Data",
                "TestQuestions.json"
            );

            var json = File.ReadAllText(path);

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            _cache = JsonSerializer.Deserialize<List<PersonalityQuestion>>(json, options);

            return _cache;
        }
    }
}
