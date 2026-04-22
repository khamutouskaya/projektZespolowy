namespace MentalOS.Services.Interfaces
{
    public interface IPasswordResetService
    {
        Task<string?> RequestResetAsync(string email, CancellationToken ct = default);

        Task ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default);
    }
}
