namespace MentalOS.DTOs.ChatDTOs
{
    public class ChatMessageDto
    {
        public string Sender { get; set; }
        public string Content { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
