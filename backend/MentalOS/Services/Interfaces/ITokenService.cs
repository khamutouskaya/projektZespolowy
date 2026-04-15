using MentalOS.Domain;

namespace MentalOS.Services.Interfaces
{
    /// <summary>
    /// Interfejs serwisu generowania tokenów
    /// </summary>
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}