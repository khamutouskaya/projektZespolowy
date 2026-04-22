using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.DTOs;
using MentalOS.Services;
using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MentalOS.Controllers
{
    /// <summary>
    /// Endpointy autoryzacji - obsługuje rejestrację, logowanie (lokalne + OAuth)
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly IOAuthService _oauthService;
        private readonly ILogger<AuthController> _logger;
        private readonly IPasswordResetService _passwordResetService;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthController(
            AppDbContext context,
            IPasswordHasher<User> passwordHasher,
            ITokenService tokenService,
            IOAuthService oauthService,
            ILogger<AuthController> logger,
            IPasswordResetService passwordResetService,
            IConfiguration config,
            IEmailService emailService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _oauthService = oauthService;
            _logger = logger;
            _passwordResetService = passwordResetService;
            _config = config;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "User already exists" });
            }

            var user = new User
            {
                Email = request.Email,
                PersonalityType = request.PersonalityType ?? "unknown",
                IsAdmin = false,
                Provider = "local",
                ProviderUserId = null,


                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "user");
            if (userRole != null)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = userRole.Id,

                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
            }

            var token = _tokenService.GenerateToken(user);

            return Ok(new { token, user = new { user.Id, user.Email, user.PersonalityType } });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (user.Provider != "local" || string.IsNullOrEmpty(user.PasswordHash))
            {
                return BadRequest(new { message = $"This account is registered with {user.Provider}. Please use {user.Provider} login." });
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var isAdmin = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == user.Id &&
                               _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "admin"));

            user.IsAdmin = isAdmin;

            var token = _tokenService.GenerateToken(user);

            return Ok(new 
                { 
                    token, 
                    user = new 
                    { 
                        user.Id, 
                        user.Email, 
                        user.PersonalityType, 
                        user.IsAdmin 
                    }
                }

            );
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.IdToken))
            {
                return BadRequest(new { message = "ID token is required" });
            }

            var user = await _oauthService.AuthenticateWithGoogleAsync(request.IdToken);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid Google token" });
            }

            var isAdmin = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == user.Id &&
                               _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "admin"));

            user.IsAdmin = isAdmin;

            var token = _tokenService.GenerateToken(user);

            _logger.LogInformation("User {Email} logged in via Google", user.Email);

            return Ok(new { token, user = new { user.Id, user.Email, user.IsAdmin } });
        }

        [HttpPost("facebook")]
        public async Task<IActionResult> FacebookLogin([FromBody] FacebookLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.AccessToken))
            {
                return BadRequest(new { message = "Access token is required" });
            }

            var user = await _oauthService.AuthenticateWithFacebookAsync(request.AccessToken);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid Facebook token" });
            }

            var isAdmin = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == user.Id &&
                               _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "admin"));

            user.IsAdmin = isAdmin;

            var token = _tokenService.GenerateToken(user);

            _logger.LogInformation("User {Email} logged in via Facebook", user.Email);

            return Ok(new { token, user = new { user.Id, user.Email, user.IsAdmin } });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request, CancellationToken ct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string? token = null;

            try
            {
                token = await _passwordResetService.RequestResetAsync(request.Email, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting password reset for {Email}", request.Email);
                return StatusCode(500, new { message = "An error occurred while processing your request"});
            }

            if (!string.IsNullOrEmpty(token))
            {
                var baseUrl = _config["App:ResetPasswordUrlBase"];

                if (string.IsNullOrEmpty(baseUrl))
                {
                    _logger.LogError("App:ResetPasswordUrlBase is not configured.");
                    return StatusCode(500, new { error = "CONFIG_ERROR", message = "Reset link base URL is not configured." });
                }

                var link = baseUrl + token;

                var subject = "Resset your password on MentalOS"; // Change this html block!!!
                var body =
                $"<p>To reset your password, open this link:</p>" +
                $"<p><a href='{link}'>{link}</a></p>" +
                $"<p>If you did not request a password reset, you can ignore this email.</p>";

                try
                {
                    await _emailService.SendEmailAsync(request.Email, subject, body, ct);
                    _logger.LogInformation("Password reset email sent to {Email}", request.Email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending password reset email to {Email}", request.Email);
                }
            }

            return Ok(new
            {
                message = "If an account with that email exists, a password reset link has been sent."
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request, CancellationToken ct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                await _passwordResetService.ResetPasswordAsync(request.Token, request.NewPassword, ct);
                return Ok(new { message = "Password has been changed." });
            }
            catch (ExpiredResetTokenException ex)
            {
                return StatusCode(410, new { error = "RESET_TOKEN_EXPIRED", message = ex.Message });
            }
            catch (WeakPasswordException ex)
            {
                return BadRequest(new { error = "WEAK_PASSWORD", message = ex.Message });
            }
            catch (NotLocalAccountException ex)
            {
                return BadRequest(new { error = "NOT_LOCAL_ACCOUNT", message = ex.Message });
            }
            catch (InvalidResetTokenException ex)
            {
                return BadRequest(new { error = "INVALID_RESET_TOKEN", message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during reset-password");
                return StatusCode(500, new { error = "INTERNAL_ERROR", message = "Server error." });
            }
        }
    }

    public record RegisterRequest(string Email, string Password, string? PersonalityType);
    public record LoginRequest(string Email, string Password);
    public record GoogleLoginRequest(string IdToken);
    public record FacebookLoginRequest(string AccessToken);
}
