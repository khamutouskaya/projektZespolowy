using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Middleware;
using MentalOS.Options;
using MentalOS.Services;
using MentalOS.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Konfiguracja Serilog - logowanie do konsoli i rotowanych plików dziennych
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddControllers();

// Blazor SSR and Interactive Server Components for Admin Panel
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Baza danych PostgreSQL z EF Core
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Serwisy autoryzacji i JWT
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IOAuthService, OAuthService>();
builder.Services.AddScoped<IPasswordPolicy, DefaultPasswordPolicy>();
builder.Services.AddScoped<IEmailService, GmailSmtpEmailService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddHttpClient();

//Serwisy OpnAI i VoiceToText
builder.Services.Configure<OpenAiOptions>(
    builder.Configuration.GetSection("OpenAI"));

builder.Services.AddHttpClient<ISpeechService, OpenAiSpeechService>();

//Serwisy AI chat assystenta
builder.Services.AddHttpClient<IAiChatService, OpenAiChatService>();

builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IContextBuilder, ContextBuilder>();

// Serwis w tle ds. wysy³ania powiadomieñ
builder.Services.AddHostedService<DailySummaryNotificationService>();

// Serwis w tle ds. zarz¹dzania i archiwizacji danych bez blokowania API
builder.Services.AddHostedService<DataArchivingService>();

//Streak system
builder.Services.AddScoped<IStreakService, StreakService>();
builder.Services.AddScoped<IShopService, ShopService>();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "MentalOS_Super_Secret_Key_12345!@#_To_Generate_Signatures";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MentalOS";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MentalOS";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

// CORS - dostêp dla wszystkich Ÿróde³ (skonfigurowane dla aplikacji mobilnej)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger z autoryzacj¹ JWT Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "MentalOS API", 
        Version = "v1",
        Description = "Mental health tracking application API with OAuth support"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Enter: Bearer [space] your-token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Inicjalizacja bazy danych - sprawdzenie po³¹czenia, utworzenie roli/u¿ytkownika admin jeœli potrzeba
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Checking database connection...");
        db.Database.SetCommandTimeout(10);
        
        var canConnect = db.Database.CanConnect();

        if (canConnect)
        {
            logger.LogInformation("? Database connection successful!");

            logger.LogInformation("Applying migrations...");
            db.Database.Migrate();

            var adminRole = db.Roles.FirstOrDefault(r => r.Name == "admin");
            if (adminRole == null)
            {
                logger.LogInformation("Creating default 'admin' role...");
                adminRole = new Role 
                { 
                    Name = "admin", 
                    Description = "Administrator with full access"
                };
                db.Roles.Add(adminRole);
                db.SaveChanges();
                logger.LogInformation("? Admin role created");
            }
            
            // SprawdŸ czy istnieje admin user
            var adminUser = db.Users.FirstOrDefault(u => u.Email == "admin@local");
            if (adminUser == null)
            {
                logger.LogInformation("Creating default admin user...");
                var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
                adminUser = new User 
                { 
                    Email = "admin@local",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin123!");
                db.Users.Add(adminUser);
                db.SaveChanges();
                
                var userRole = new UserRole
                {
                    UserId = adminUser.Id,
                    RoleId = adminRole.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.UserRoles.Add(userRole);
                db.SaveChanges();
                
                logger.LogInformation("? Admin user created: admin@local / Admin123!");
            }
        }
        else
        {
            logger.LogWarning("?? Cannot connect to database!");
        }
    }
}
catch (Exception ex)
{
    Log.Error(ex, "An error occurred while checking the database. The application will continue to run.");
    Console.WriteLine($"WARNING: Database check failed: {ex.Message}");
    Console.WriteLine("Please ensure PostgreSQL is running and the connection string is correct.");
}

app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MentalOS API v1");
    });
}

app.UseCors();

app.UseStaticFiles(); // new - obs³uga statycznych plików (np. awatary)
app.UseAntiforgery(); // wymagane dla Blazora w .NET 8

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Mapowanie komponentów Blazor dla panelu Administratora
app.MapRazorComponents<MentalOS.Components.App>()
    .AddInteractiveServerRenderMode();

app.Run();
