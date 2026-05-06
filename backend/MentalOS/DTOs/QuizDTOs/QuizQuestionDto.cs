namespace MentalOS.DTOs.QuizDTOs
{
    public class QuizOptionDto
    {
        public string Key { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string PersonalityTypeKey { get; set; } = string.Empty;
    }

    public class QuizQuestionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public List<QuizOptionDto> Options { get; set; } = new();
    }
}
