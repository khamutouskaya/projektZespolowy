using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.DTOs.ChatDTOs;
using MentalOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace MentalOS.Services
{
    public class ChatService : IChatService
    {
        private const int MAX_HISTORY_MESSAGES = 20;

        private readonly AppDbContext _db;
        private readonly IContextBuilder _contextBuilder;
        private readonly IAiChatService _aiChatService;

        public ChatService(AppDbContext db,
            IContextBuilder contextBuilder, 
            IAiChatService aiChatService)
        {
            _db = db;
            _contextBuilder = contextBuilder;
            _aiChatService = aiChatService;
        }

        public async Task<Guid> CreateSessionAsync(Guid userId, string? title)
        {
            var session = new ChatSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = title,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.ChatSessions.Add(session);

            await _db.SaveChangesAsync();

            return session.Id;
        }

        public async Task<IEnumerable<ChatMessageDto>> GetHistoryAsync(Guid sessionId)
        {
            return await _db.ChatMessages
                .Where(cm => cm.SessionId == sessionId)
                .OrderBy(cm => cm.CreatedAt)
                .Select(cm => new ChatMessageDto
                {
                    Sender = cm.Sender,
                    Content = cm.Content,
                    CreatedAt = cm.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ChatResponceDto> SendMessageAsync(Guid userId, ChatRequestDto request)
        {
            var userMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = request.SessionId,
                Sender = "user",
                Content = request.Message,
                CreatedAt = DateTime.UtcNow
            };

            _db.ChatMessages.Add(userMessage);
            
            await _db.SaveChangesAsync();

            var history = await _db.ChatMessages
                .Where(cm => cm.SessionId == request.SessionId)
                .OrderByDescending(cm => cm.CreatedAt)
                .Take(MAX_HISTORY_MESSAGES)
                .OrderBy(cm => cm.CreatedAt)
                .ToListAsync();

            var context = await _contextBuilder.BuildContextAsync(userId);

            var messages = new List<object>();

            messages.Add(new
            {
                role = "system",
                content = $"""
You are a supportive AI assistant inside MentalOS.

User context:
{context}

Be supportive, calm and helpful.
"""
            });

            foreach(var msg in history)
            {
                messages.Add(new
                {
                    role = msg.Sender,
                    content = msg.Content
                });
            }

            var aiResponse = await _aiChatService.GetResponseAsync(messages);

            var aiMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = request.SessionId,
                Sender = "assistant",
                Content = aiResponse,
                CreatedAt = DateTime.UtcNow
            };

            _db.ChatMessages.Add(aiMessage);

            await _db.SaveChangesAsync();

            return new ChatResponceDto
            {
                Responce = aiResponse
            };
        }
    }
}
