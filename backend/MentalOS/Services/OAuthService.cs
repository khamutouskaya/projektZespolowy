using Google.Apis.Auth;
using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace MentalOS.Services
{
    /// <summary>
    /// Autoryzacja OAuth - obs³uguje logowanie/rejestracjê przez Google i Facebook
    /// Waliduje tokeny, tworzy/aktualizuje u¿ytkowników, przypisuje domyœln¹ rolê "user"
    /// </summary>
    public class OAuthService : IOAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OAuthService> _logger;
        private readonly HttpClient _httpClient;

        public OAuthService(AppDbContext context, IConfiguration configuration, ILogger<OAuthService> logger, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task<User?> AuthenticateWithGoogleAsync(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["OAuth:Google:ClientId"]! }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                if (payload == null || string.IsNullOrEmpty(payload.Email))
                {
                    _logger.LogWarning("Invalid Google token or missing email");
                    return null;
                }

                var provider = "google";
                var providerUserId = payload.Subject;

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Provider == provider && u.ProviderUserId == providerUserId);

                if (user == null)
                {
                    var existingByEmail = await _context.Users
                        .FirstOrDefaultAsync(u => u.Email == payload.Email);

                    if (existingByEmail != null)
                    {
                        if (existingByEmail.Provider != provider)
                        {
                            _logger.LogWarning(
                                "Google login conflict. Email {Email} already belongs to provider {ExistingProvider}",
                                payload.Email,
                                existingByEmail.Provider
                            );

                            return null;
                        }

                        user = existingByEmail;
                    }
                }

                if (user == null)
                {
                    user = new User
                    {
                        Email = payload.Email,
                        Provider = provider,
                        ProviderUserId = providerUserId,
                        PasswordHash = null,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

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

                    _logger.LogInformation("New user registered with Google: {Email}", payload.Email);
                }
                else
                {
                    user.UpdatedAt = DateTime.UtcNow;
                    user.Provider = provider;
                    user.ProviderUserId = providerUserId;

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("User {Email} logged in with Google", payload.Email);
                }

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating with Google");
                return null;
            }
        }

        public async Task<User?> AuthenticateWithFacebookAsync(string accessToken)
        {
            try
            {
                var appId = _configuration["OAuth:Facebook:AppId"];
                var appSecret = _configuration["OAuth:Facebook:AppSecret"];

                var tokenValidationUrl = $"https://graph.facebook.com/debug_token?input_token={accessToken}&access_token={appId}|{appSecret}";
                var validationResponse = await _httpClient.GetStringAsync(tokenValidationUrl);
                var validationData = JsonSerializer.Deserialize<FacebookTokenValidation>(validationResponse);

                if (validationData?.Data?.IsValid != true)
                {
                    _logger.LogWarning("Invalid Facebook token");
                    return null;
                }

                var userInfoUrl = $"https://graph.facebook.com/me?fields=id,email,name&access_token={accessToken}";
                var userInfoResponse = await _httpClient.GetStringAsync(userInfoUrl);
                var userInfo = JsonSerializer.Deserialize<FacebookUserInfo>(userInfoResponse);

                if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
                {
                    _logger.LogWarning("Facebook user info missing email");
                    return null;
                }

                var provider = "facebook";
                var providerUserId = userInfo.Id;

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Provider == provider && u.ProviderUserId == providerUserId);

                if (user == null)
                {
                    var existingByEmail = await _context.Users
                        .FirstOrDefaultAsync(u => u.Email == userInfo.Email);

                    if (existingByEmail != null)
                    {
                        if (existingByEmail.Provider != provider)
                        {
                            _logger.LogWarning(
                                "Facebook login conflict. Email {Email} already belongs to provider {ExistingProvider}",
                                userInfo.Email,
                                existingByEmail.Provider
                            );

                            return null;
                        }

                        user = existingByEmail;
                    }
                }

                if (user == null)
                {
                    user = new User
                    {
                        Email = userInfo.Email,
                        Provider = provider,
                        ProviderUserId = providerUserId,
                        PasswordHash = null,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

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

                    _logger.LogInformation("New user registered via Facebook: {Email}", userInfo.Email);
                }
                else
                {
                    user.UpdatedAt = DateTime.UtcNow;
                    user.Provider = provider;
                    user.ProviderUserId = providerUserId;

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("User {Email} logged in via Facebook", userInfo.Email);
                }

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating with Facebook");
                return null;
            }
        }
    }

    public class FacebookTokenValidation
    {
        public FacebookTokenData? Data { get; set; }
    }

    public class FacebookTokenData
    {
        public bool IsValid { get; set; }
    }

    public class FacebookUserInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
