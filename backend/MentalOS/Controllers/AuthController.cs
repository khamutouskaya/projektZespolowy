using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services;
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

        public AuthController(
            AppDbContext context, 
            IPasswordHasher<User> passwordHasher, 
            ITokenService tokenService,
            IOAuthService oauthService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _oauthService = oauthService;
            _logger = logger;
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
                Provider = "local"
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

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

            var token = _tokenService.GenerateToken(user);

            return Ok(new { token, user = new { user.Id, user.Email, user.PersonalityType, user.IsAdmin } });
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
    }

    public record RegisterRequest(string Email, string Password, string? PersonalityType);
    public record LoginRequest(string Email, string Password);
    public record GoogleLoginRequest(string IdToken);
    public record FacebookLoginRequest(string AccessToken);
}
