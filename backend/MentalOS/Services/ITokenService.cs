using MentalOS.Domain;

namespace MentalOS.Services
{
    /// <summary>
    /// Interfejs serwisu generowania tokenów
    /// </summary>
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}