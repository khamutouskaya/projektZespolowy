namespace MentalOS.DTOs.ChatDTOs
{
    public class ChatRequestDto
    {
        public Guid SessionId { get; set; }
        public string Message { get; set; } = null!;
    }
}
