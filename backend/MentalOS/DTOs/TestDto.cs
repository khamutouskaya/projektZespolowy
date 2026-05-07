namespace MentalOS.DTOs
{
    public class AnswerDto
    {
        public int QuestionId { get; set; }
        public int Value { get; set; } // 1–5
    }

    public class SubmitTestDto
    {
        public List<AnswerDto> Answers { get; set; }
    }
}
