namespace MentalOS.Services.Interfaces
{
    public interface IContextBuilder
    {
        Task<string> BuildContextAsync(Guid userId);
    }
}
