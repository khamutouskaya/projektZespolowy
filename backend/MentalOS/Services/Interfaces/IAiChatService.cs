namespace MentalOS.Services.Interfaces
{
    public interface IAiChatService
    {
        Task<string> GetResponseAsync(List<object> messages);
    }
}
