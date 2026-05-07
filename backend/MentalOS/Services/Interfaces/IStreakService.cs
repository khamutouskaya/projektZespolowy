using MentalOS.Domain;

namespace MentalOS.Services.Interfaces
{
    public interface IStreakService
    {
        Task HandleDailyActivity(Guid userId);
        Task Add(Guid userId, int amount, string action);
        Task AddBalance(User user, int amount, string action);
        Task<int> GetCurrentStreak(Guid userId);
        Task CheckStreak(Guid userId);
    }
}
