namespace MentalOS.Services.Interfaces
{
    public interface IStreakService
    {
        Task HandleDailyActivity(Guid userId);
        Task Add(Guid userId, int amount, string action);
        Task Spend(Guid userId, int amount, string action);
        Task<int> GetBalance(Guid userId);
        Task<int> GetCurrentStreak(Guid userId);
    }
}
