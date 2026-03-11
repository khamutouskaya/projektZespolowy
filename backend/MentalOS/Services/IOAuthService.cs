using MentalOS.Domain;

namespace MentalOS.Services
{
    /// <summary>
    /// Interfejs serwisu OAuth - autoryzacja Google i Facebook
    /// </summary>
    public interface IOAuthService
    {
        Task<User?> AuthenticateWithGoogleAsync(string idToken);
        Task<User?> AuthenticateWithFacebookAsync(string accessToken);
    }
}
