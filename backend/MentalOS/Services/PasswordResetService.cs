using MentalOS.Data;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;


namespace MentalOS.Services
{
    public abstract class PasswordResetException : Exception
    {
        protected PasswordResetException(string message) : base(message) {}
    }

    public sealed class InvalidResetTokenException : PasswordResetException
    {
        public InvalidResetTokenException() : base("Invalid or already used reset token."){}
        public InvalidResetTokenException(string message) : base(message) { }
    }
    public sealed class ExpiredResetTokenException : PasswordResetException
    {
        public ExpiredResetTokenException() : base("Reset token has expired.") { }
        public ExpiredResetTokenException(string message) : base(message) { }
    }
    public sealed class WeakPasswordException : PasswordResetException
    {
        public WeakPasswordException() : base("The new password does not meet security requirements.") { }
        public WeakPasswordException(string message) : base(message) { }
    }
    public sealed class NotLocalAccountException : PasswordResetException
    {
        public NotLocalAccountException() : base("This account does not use a local password. Try Google or Facebook login.") { }
        public NotLocalAccountException(string message) : base(message) { }
    }
    public class PasswordResetService : IPasswordResetService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PasswordResetService> _logger;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IPasswordPolicy _passwordPolicy;

        public PasswordResetService(
            AppDbContext context, 
            IPasswordHasher<User> passwordHasher, 
            ILogger<PasswordResetService> logger,
            IPasswordPolicy passwordPolicy
            )
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _logger = logger;
            _passwordPolicy = passwordPolicy;
        }

        public async Task<string?> RequestResetAsync(string email, CancellationToken ct = default)
        {

            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogWarning("Password reset requested with empty email.");
                return null;
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email, ct);

            if (user == null)
            {
                _logger.LogWarning("null user");
                return null;
            }

            if (user.Provider != "local")
            {
                _logger.LogWarning("Password reset requested for non-local account: {Email}", email);
                throw new NotLocalAccountException();
            }
            if (string.IsNullOrEmpty(user.PasswordHash)) // for bugfix with OAuth/Local accounts problem
            {
                _logger.LogError("Local account without password hash detected. UserId: {UserId}, Email: {Email}", user.Id, user.Email);
                throw new InvalidOperationException("Local account does not have a password hash.");
            }

            var now = DateTime.UtcNow;

            var activeToken = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && t.UsedAt == null && t.ExpiresAt > now)
                .ToListAsync(ct);

            foreach (var token in activeToken)
            {
                token.UsedAt = now;
            }

            var rawToken = GenerateResetToken();
            var tokenHash = Sha256Hex(rawToken);

            var entity = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                CreatedAt = now,
                ExpiresAt = now.AddHours(1),
                UsedAt = null
            };

            _context.PasswordResetTokens.Add(entity);

            _logger.LogInformation("RequestResetAsync: email={Email}, userFound={Found}", email, user != null);

            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("RequestResetAsync: token created for userId={UserId}", user.Id);

            return rawToken;
        }

        public async Task ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Password reset attempted with empty token.");
                throw new InvalidResetTokenException("Reset token cannot be empty.");
            }

            _passwordPolicy.Validate(newPassword); // Validate password strength, change validation logic as needed

            var now = DateTime.UtcNow;
            var tokenHash = Sha256Hex(token);
            var tokenEntity = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

            if (tokenEntity is null || tokenEntity.UsedAt != null)
            {
                _logger.LogWarning("Invalid or already used reset token attempted: {TokenHash}", tokenHash);
                throw new InvalidResetTokenException("Reset token is invalid or has already been used.");
            }

            if (tokenEntity.ExpiresAt <= now)
            {
                _logger.LogWarning("Expired reset token attempted: {TokenHash}", tokenHash);
                throw new ExpiredResetTokenException("Reset token has expired.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == tokenEntity.UserId, ct);

            if (user is null)
            {
                _logger.LogError("User not found for valid reset token: {UserId}", tokenEntity.UserId);
                throw new InvalidResetTokenException("Associated user account not found.");
            }

            if(user.Provider != "local")
            {
                _logger.LogWarning("Password reset attempted for non-local account: {UserId}", user.Id);
                throw new NotLocalAccountException(); // change to retun null if you want to hide this information about account type (OAuth or local)
            }

            if (string.IsNullOrEmpty(user.PasswordHash)) // for bugfix with OAuth/Local accounts problem
            {
                _logger.LogError("Local account without password hash detected. UserId: {UserId}, Email: {Email}", user.Id, user.Email);
                throw new InvalidOperationException("Local account does not have a password hash.");
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);
            tokenEntity.UsedAt = now;

            await _context.SaveChangesAsync(ct);
            _logger.LogInformation("Password reset successful for user: {UserId}", user.Id);
        }

        private static string GenerateResetToken()
        {
            Span<byte> bytes = stackalloc byte[32];
            RandomNumberGenerator.Fill(bytes);

            return Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
        }

        private static string Sha256Hex(string input)
        {
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = SHA256.HashData(bytes);

            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }


    public interface IPasswordPolicy
    {
        void Validate(string password);
    }

    public sealed class DefaultPasswordPolicy : IPasswordPolicy
    {
        public void Validate(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new WeakPasswordException("Password cannot be empty.");

            if (password.Length < 8)
                throw new WeakPasswordException("Password must be at least 8 characters long.");

            if (!password.Any(char.IsDigit))
                throw new WeakPasswordException("Password must contain at least one digit.");

            if (!password.Any(char.IsUpper))
                throw new WeakPasswordException("Password must contain at least one uppercase letter.");
        }
    }
}
