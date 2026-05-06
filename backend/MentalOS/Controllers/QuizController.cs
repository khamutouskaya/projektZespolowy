using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.DTOs.QuizDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/quiz")]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizController(AppDbContext context)
        {
            _context = context;
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
                return userId;
            return null;
        }

        private static readonly List<QuizQuestionDto> _questions = new()
        {
            new QuizQuestionDto
            {
                Id = 1,
                Text = "Kiedy ktoś bliski ma problem, co robisz w pierwszej kolejności?",
                Options = new()
                {
                    new() { Key = "A", Text = "Słucham i staram się zrozumieć jego uczucia", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Analizuję sytuację i szukam najlepszego rozwiązania", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Biorę inicjatywę i pomagam działać", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Staram się go zainspirować i pokazać nowe perspektywy", PersonalityTypeKey = "marzyciel" },
                }
            },
            new QuizQuestionDto
            {
                Id = 2,
                Text = "Jak reagujesz na stres?",
                Options = new()
                {
                    new() { Key = "A", Text = "Rozmawiam z kimś i szukam wsparcia emocjonalnego", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Układam plan działania i rozkładam problem na czynniki", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Działam natychmiast — ruch to moje lekarstwo", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Szukam ucieczki w kreatywności lub marzeniach", PersonalityTypeKey = "marzyciel" },
                }
            },
            new QuizQuestionDto
            {
                Id = 3,
                Text = "Co jest dla Ciebie najważniejsze w relacjach?",
                Options = new()
                {
                    new() { Key = "A", Text = "Wzajemne zrozumienie i bliskość emocjonalna", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Szczerość i logiczne podejście do problemów", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Wzajemny szacunek i osiąganie celów razem", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Wspólne marzenia i inspirowanie się nawzajem", PersonalityTypeKey = "marzyciel" },
                }
            },
            new QuizQuestionDto
            {
                Id = 4,
                Text = "Jak wolisz spędzać wolny czas?",
                Options = new()
                {
                    new() { Key = "A", Text = "Spotykam się z bliskimi i słucham ich historii", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Czytam, uczę się lub rozwiązuję zagadki", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Uprawiam sport lub realizuję projekty", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Tworzę — rysuję, piszę, marzę o przyszłości", PersonalityTypeKey = "marzyciel" },
                }
            },
            new QuizQuestionDto
            {
                Id = 5,
                Text = "Gdy musisz podjąć ważną decyzję, co robisz?",
                Options = new()
                {
                    new() { Key = "A", Text = "Pytam innych o zdanie i uwzględniam ich uczucia", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Zbieram informacje i analizuję wszystkie opcje", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Podejmuję decyzję szybko i działam", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Ufam intuicji i wewnętrznemu głosowi", PersonalityTypeKey = "marzyciel" },
                }
            },
            new QuizQuestionDto
            {
                Id = 6,
                Text = "Jak opisałbyś swoje podejście do pracy?",
                Options = new()
                {
                    new() { Key = "A", Text = "Lubię pomagać innym i dbam o atmosferę w zespole", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Skupiam się na detalach i chcę robić wszystko najlepiej", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Biorę odpowiedzialność i motywuję innych do działania", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Szukam nowych, kreatywnych sposobów na problemy", PersonalityTypeKey = "marzyciel" },
                }
            },
            new QuizQuestionDto
            {
                Id = 7,
                Text = "Co najczęściej sprawia Ci trudność?",
                Options = new()
                {
                    new() { Key = "A", Text = "Ignorowanie uczuć innych ludzi", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Działanie bez wcześniejszego przemyślenia", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Brak kontroli nad sytuacją", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Powtarzalność i brak przestrzeni na twórczość", PersonalityTypeKey = "marzyciel" },
                }
            },
            new QuizQuestionDto
            {
                Id = 8,
                Text = "Jakie słowa najlepiej Cię opisują?",
                Options = new()
                {
                    new() { Key = "A", Text = "Empatyczny, ciepły, wrażliwy", PersonalityTypeKey = "empatyk" },
                    new() { Key = "B", Text = "Logiczny, precyzyjny, dokładny", PersonalityTypeKey = "analityk" },
                    new() { Key = "C", Text = "Zdecydowany, energiczny, ambitny", PersonalityTypeKey = "lider" },
                    new() { Key = "D", Text = "Kreatywny, intuicyjny, otwarty na zmiany", PersonalityTypeKey = "marzyciel" },
                }
            },
        };

        private static readonly Dictionary<string, (string Title, string Description)> _descriptions = new()
        {
            ["empatyk"] = (
                "Empatyk",
                "Jesteś wrażliwą i ciepłą osobą, która doskonale czuje potrzeby innych. Twoja siłą jest umiejętność słuchania i budowania głębokich, autentycznych relacji. Naturalnie wspierasz tych wokół Ciebie i tworzysz bezpieczną przestrzeń do wyrażania emocji. Dbaj o siebie równie mocno, jak dbasz o innych."
            ),
            ["analityk"] = (
                "Analityk",
                "Masz wyjątkową zdolność do logicznego myślenia i rozwiązywania problemów. Cenisz precyzję i fakty, a Twoje decyzje są dobrze przemyślane. Zanim działasz, dokładnie analizujesz sytuację — to Twoja wielka siła. Pamiętaj, że czasem warto też posłuchać intuicji."
            ),
            ["lider"] = (
                "Lider",
                "Jesteś osobą działania — energiczną, zdecydowaną i ambitną. Naturalnie przejmujesz inicjatywę i motywujesz innych. Twoja siłą jest odwaga i umiejętność prowadzenia przez wyzwania. Pamiętaj, by od czasu do czasu zwolnić i pozwolić sobie na odpoczynek."
            ),
            ["marzyciel"] = (
                "Marzyciel",
                "Masz bogatą wyobraźnię i nieskończoną kreatywność. Widzisz możliwości tam, gdzie inni widzą ograniczenia. Twoja intuicja i oryginalność inspirują otoczenie do myślenia poza schematami. Pielęgnuj swoje marzenia — to one napędzają zmiany."
            ),
        };

        [HttpGet("questions")]
        public IActionResult GetQuestions()
        {
            return Ok(_questions);
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var scores = new Dictionary<string, int>
            {
                ["empatyk"] = 0,
                ["analityk"] = 0,
                ["lider"] = 0,
                ["marzyciel"] = 0,
            };

            foreach (var answer in dto.Answers)
            {
                var question = _questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question == null) continue;
                var option = question.Options.FirstOrDefault(o => o.Key == answer.SelectedKey);
                if (option == null) continue;
                if (scores.ContainsKey(option.PersonalityTypeKey))
                    scores[option.PersonalityTypeKey]++;
            }

            var dominantType = scores.OrderByDescending(s => s.Value).First().Key;

            var profile = await _context.PersonalityProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId.Value);

            if (profile == null)
            {
                profile = new PersonalityProfile
                {
                    UserId = userId.Value,
                    PersonalityType = dominantType,
                    Traits = System.Text.Json.JsonSerializer.Serialize(scores),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                _context.PersonalityProfiles.Add(profile);
            }
            else
            {
                profile.PersonalityType = dominantType;
                profile.Traits = System.Text.Json.JsonSerializer.Serialize(scores);
                profile.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var (title, description) = _descriptions.TryGetValue(dominantType, out var desc)
                ? desc
                : (dominantType, "Twój unikalny typ osobowości.");

            return Ok(new QuizResultDto
            {
                PersonalityType = dominantType,
                Title = title,
                Description = description,
                Scores = scores,
            });
        }
    }
}
