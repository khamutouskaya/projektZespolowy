using MentalOS.DTOs.ChatDTOs;

namespace MentalOS.Services.Interfaces
{
    public interface IChatService
    {
        Task<ChatResponceDto> SendMessageAsync(Guid userId, ChatRequestDto request);

        Task<IEnumerable<ChatMessageDto>> GetHistoryAsync(Guid sessionId);
    
        Task<Guid> CreateSessionAsync(Guid userId, string? title);
    }
}
