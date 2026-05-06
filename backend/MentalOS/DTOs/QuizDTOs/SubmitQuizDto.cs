namespace MentalOS.DTOs.QuizDTOs
{
    public class QuizAnswerDto
    {
        public int QuestionId { get; set; }
        public string SelectedKey { get; set; } = string.Empty;
    }

    public class SubmitQuizDto
    {
        public List<QuizAnswerDto> Answers { get; set; } = new();
    }
}
