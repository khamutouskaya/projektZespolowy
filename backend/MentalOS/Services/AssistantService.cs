namespace MentalOS.Services
{
    /// <summary>
    /// Lightweight server-side assistant used by the mobile chat screen.
    /// This keeps the module functional even before a real LLM provider is wired in.
    /// </summary>
    public class AssistantService
    {
        private static readonly string[] CrisisKeywords =
        {
            "suicide",
            "kill myself",
            "self harm",
            "hurt myself",
            "want to die",
            "end my life",
            "samob",
            "zabić się",
            "zabic sie",
            "chcę umrzeć",
            "chce umrzec",
            "odebrać sobie życie",
            "odebrac sobie zycie"
        };

        private static readonly string[] AnxietyKeywords =
        {
            "anxious",
            "anxiety",
            "panic",
            "stress",
            "stressed",
            "overwhelmed",
            "lęk",
            "lek",
            "panik",
            "stres",
            "przytłocz",
            "przytlocz"
        };

        private static readonly string[] LowMoodKeywords =
        {
            "sad",
            "lonely",
            "empty",
            "hopeless",
            "exhausted",
            "tired",
            "smut",
            "samot",
            "pustk",
            "beznadziej",
            "zmęcz",
            "zmecz"
        };

        public Task<string> GenerateReplyAsync(string message, CancellationToken cancellationToken = default)
        {
            var trimmed = message.Trim();
            var normalized = trimmed.ToLowerInvariant();

            if (ContainsAny(normalized, CrisisKeywords))
            {
                return Task.FromResult(
                    "Brzmi to tak, jakbyś mógł być teraz w bezpośrednim niebezpieczeństwie. Skontaktuj się natychmiast z lokalnym numerem alarmowym albo telefonem zaufania i poproś zaufaną osobę, żeby była teraz z Tobą."
                );
            }

            if (ContainsAny(normalized, AnxietyKeywords))
            {
                return Task.FromResult(
                    "Brzmi, jakby naraz spadło na Ciebie bardzo dużo. Zacznij od małego kroku: rozluźnij ramiona, weź cztery spokojne oddechy i wybierz jedną rzecz, którą możesz zrobić w ciągu najbliższych dziesięciu minut."
                );
            }

            if (ContainsAny(normalized, LowMoodKeywords))
            {
                return Task.FromResult(
                    "To brzmi ciężko. Spróbuj nazwać jedną emocję, jedną myśl, która za nią stoi, i jedną życzliwą rzecz, którą możesz zrobić dla siebie w ciągu najbliższej godziny."
                );
            }

            if (trimmed.EndsWith("?"))
            {
                return Task.FromResult(
                    $"Słyszę Twoje pytanie o „{Shorten(trimmed.TrimEnd('?'), 90)}”. Zacząłbym od jednego praktycznego kroku, a potem sprawdził, co się zmieni."
                );
            }

            return Task.FromResult(
                $"Dziękuję, że o tym piszesz. Słyszę: „{Shorten(trimmed, 120)}”. Jeśli chcesz, możemy to rozłożyć na to, co się wydarzyło, co teraz czujesz i co najbardziej pomogłoby Ci w tej chwili."
            );
        }

        private static bool ContainsAny(string source, IEnumerable<string> keywords)
        {
            return keywords.Any(keyword => source.Contains(keyword, StringComparison.Ordinal));
        }

        private static string Shorten(string value, int maxLength)
        {
            if (value.Length <= maxLength)
            {
                return value;
            }

            return $"{value[..(maxLength - 3)].TrimEnd()}...";
        }
    }
}
