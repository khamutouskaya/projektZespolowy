using MentalOS.DTOs;
using MentalOS.Services.Interfaces;

namespace MentalOS.Services
{
    /// <summary>
    /// Serwis osobowości Big Five — przetwarza odpowiedzi użytkownika z testu OCEAN i oblicza wyniki dla każdej cechy
    /// </summary>
    public class PersonalityService
    {
        private readonly IQuestionProvider _provider;

        public PersonalityService(IQuestionProvider provider)
        {
            _provider = provider;
        }

        public Dictionary<string, double> Calculate(List<AnswerDto> answers)
        {
            var questions = _provider.GetQuestions();

            var result = new Dictionary<string, List<int>>
        {
            { "O", new() },
            { "C", new() },
            { "E", new() },
            { "A", new() },
            { "N", new() }
        };

            foreach (var answer in answers)
            {
                var q = questions.FirstOrDefault(x => x.Id == answer.QuestionId);

                if (q == null)
                    throw new Exception($"Question {answer.QuestionId} not found");

                int value = q.Reverse
                    ? (6 - answer.Value)
                    : answer.Value;

                result[q.Trait].Add(value);
            }

            return result.ToDictionary(
                x => x.Key,
                x => Math.Round(x.Value.Average(), 2)
            );
        }
    }
}
