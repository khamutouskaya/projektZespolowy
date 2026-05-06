namespace MentalOS.DTOs.QuizDTOs
{
    public class QuizResultDto
    {
        public string PersonalityType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, int> Scores { get; set; } = new();
    }
}
