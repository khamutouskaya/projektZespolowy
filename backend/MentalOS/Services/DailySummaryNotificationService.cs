using MentalOS.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MentalOS.Services
{
    /// <summary>
    /// Background service that triggers daily summary notifications around 20:00.
    /// </summary>
    public class DailySummaryNotificationService : BackgroundService
    {
        private readonly ILogger<DailySummaryNotificationService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private const int NotificationHour = 20;

        public DailySummaryNotificationService(ILogger<DailySummaryNotificationService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Daily Summary Notification Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.UtcNow;
                var localTime = now.ToLocalTime(); // Adjust to local business time if needed

                // Check if it's currently 20:00 (between 20:00 and 20:59)
                if (localTime.Hour == NotificationHour)
                {
                    await ProcessDailyNotificationsAsync(now, stoppingToken);
                    // Wait until next hour to avoid repeated firing in the same hour window
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
                else
                {
                    // Check every 15 minutes if it's time
                    await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
                }
            }

            _logger.LogInformation("Daily Summary Notification Service is stopping.");
        }

        private async Task ProcessDailyNotificationsAsync(DateTime currentDate, CancellationToken stoppingToken)
        {
            _logger.LogInformation($"[DailySummary] Checking users to notify at {currentDate}...");

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var startOfDay = currentDate.Date.ToUniversalTime();
                var endOfDay = startOfDay.AddDays(1);

                // Get all users
                var allUsers = await dbContext.Users.ToListAsync(stoppingToken);
                
                // Get summary entries created today
                var summariesToday = await dbContext.JournalEntries
                    .Where(j => j.IsSummary && j.EntryDate >= startOfDay && j.EntryDate < endOfDay)
                    .Select(j => j.UserId)
                    .Distinct()
                    .ToListAsync(stoppingToken);

                var usersToNotify = allUsers.Where(u => !summariesToday.Contains(u.Id)).ToList();

                foreach (var user in usersToNotify)
                {
                    // W przyszłości integracja z usługą Push Notifications (FCM, APNS)
                    _logger.LogInformation($"[Push Notification mock] Wysłano przypomnienie do użytkownika {user.Email}: 'Czas na podsumowanie dnia!'");
                }
                
                _logger.LogInformation($"[DailySummary] Sent reminders to {usersToNotify.Count} users.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing daily notifications.");
            }
        }
    }
}