namespace MentalOS.Domain
{
    public class ChatMessage
    {
        public Guid Id { get; set; }

        public Guid SessionId { get; set; }

        public string Sender { get; set; } = null!;

        public string Content { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public ChatSession Session { get; set; } = null!;
    }
}
