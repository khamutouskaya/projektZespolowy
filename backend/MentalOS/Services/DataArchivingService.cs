using Microsoft.EntityFrameworkCore;
using MentalOS.Data;

namespace MentalOS.Services
{
    /// <summary>
    /// Robot działający w tle, odpowiedzialny za auto-archiwizacje starych danych z głównych tabel
    /// Działa całkowicie w tle i nie blokuje ani nie psuje działającego API
    /// </summary>
    public class DataArchivingService : BackgroundService
    {
        private readonly ILogger<DataArchivingService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public DataArchivingService(ILogger<DataArchivingService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DataArchivingService włączony i nasłuchuje w tle.");

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    // Uruchamiaj co ok. 24h: await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
                    // Ustanowiono co 1 godzinę do celów demonstarcyjnych:
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                    
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        
                        // Przykład archiwizacji: wszystkie zadania starsze niż 3 miesiące, 
                        // które są ukończone i wcześniej nie zarchiwizowane 
                        var limitDate = DateTime.UtcNow.AddMonths(-3);
                        var tasksToArchive = await dbContext.PlannerTasks
                            .IgnoreQueryFilters()
                            .Where(t => t.IsCompleted && t.TaskDate < limitDate && t.ArchivedAt == null)
                            .ToListAsync(stoppingToken);

                        if (tasksToArchive.Any())
                        {
                            foreach (var task in tasksToArchive)
                            {
                                task.ArchivedAt = DateTime.UtcNow;
                            }

                            await dbContext.SaveChangesAsync(stoppingToken);
                            _logger.LogInformation($"Zarchiwizowano {tasksToArchive.Count} starych PlannerTasks.");
                        }
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Zatrzymano usługę
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas archiwizacji w tle.");
            }
        }
    }
}
