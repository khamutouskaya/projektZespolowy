using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using MentalOS.DTOs;

namespace MentalOS.Services
{
    public class GardenService : IGardenService
    {
        private readonly AppDbContext _context;
        private readonly IStreakService _streakService;

        public GardenService(AppDbContext context, IStreakService streakService)
        {
            _context = context;
            _streakService = streakService;
        }

        public void UpdateBedState(GardenBed bed)
        {
            if (bed.PlantedAt == null)
            {
                bed.TreeState = TreeState.Empty;
                return;
            }

            var minutes = (DateTime.UtcNow - bed.PlantedAt.Value).TotalMinutes;

            if (minutes < 2)
                bed.TreeState = TreeState.Sprout;
            else if (minutes < 4)
                bed.TreeState = TreeState.Sapling;
            else if (minutes < 6)
                bed.TreeState = TreeState.Mature;
            else
                bed.TreeState = TreeState.Fruiting;
        }
        private List<GardenBed> CreateDefaultBeds(Guid gardenId)
        {
            var beds = new List<GardenBed>();


            for (int x = 0; x < 2; x++)
            {
                for (int y = 0; y < 3; y++)
                {
                    beds.Add(new GardenBed
                    {
                        GardenId = gardenId,
                        X = x,
                        Y = y,
                        TreeState = TreeState.Empty
                    });
                }
            }

            return beds;
        }

        public async Task<GardenStatusDto> GetGardenStatusAsync(Guid userId)
        {
            var garden = await _context.Gardens
                .Include(g => g.GardenBeds)
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (garden == null)
            {
                garden = new Garden
                {
                    UserId = userId
                };

                _context.Gardens.Add(garden);
                await _context.SaveChangesAsync();

                garden.GardenBeds = CreateDefaultBeds(garden.Id);

                await _context.SaveChangesAsync();
            }

            var beds = garden.GardenBeds;

            foreach (var bed in beds)
            {
                UpdateBedState(bed);
            }

            await _context.SaveChangesAsync();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            return new GardenStatusDto
            {
                Beds = beds.Select(b => new GardenBedDto
                {
                    Id = b.Id,
                    TreeState = b.TreeState,
                    X = b.X,
                    Y = b.Y
                }).ToList(),
                FruitsBalance = user?.FruitsBalance ?? 0
            };
        }

        public async Task ExchangeFruitAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            if (user.FruitsBalance <= 0)
                throw new Exception("No fruits available");

            user.FruitsBalance -= 1;
            user.CoinsBalance += 10;

            await _context.SaveChangesAsync();
        }

        public async Task<int> HarvestTreeAsync(Guid userId, Guid gardenBedId)
        {
            var garden = await _context.Gardens
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (garden == null)
                throw new Exception("Garden not found");

            var bed = await _context.GardenBeds
                .FirstOrDefaultAsync(b => b.Id == gardenBedId && b.GardenId == garden.Id);

            if (bed == null)
                throw new Exception("Garden bed not found");

            UpdateBedState(bed);

            if (bed.TreeState != TreeState.Fruiting)
                throw new Exception("Tree is not ready");


            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            await _streakService.AddBalance(user, 10 + (user.StreakCount * 3), "harvest");

            bed.TreeState = TreeState.Empty;
            bed.PlantedAt = null;

            await _context.SaveChangesAsync();

            return user.CoinsBalance;
        }

        public async Task PlantTreeAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            if (user.FruitsBalance <= 0)
                throw new Exception("No fruits available");

            var garden = await _context.Gardens
                .Include(g => g.GardenBeds)
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (garden == null)
            {
                garden = new Garden
                {
                    UserId = userId
                };

                _context.Gardens.Add(garden);
                await _context.SaveChangesAsync();

                garden.GardenBeds = CreateDefaultBeds(garden.Id);

                await _context.SaveChangesAsync();
            }

            var beds = garden.GardenBeds.ToList();

            foreach (var bed in beds)
            {
                UpdateBedState(bed);
            }

            var freeBed = beds.FirstOrDefault(b => b.TreeState == TreeState.Empty);

            if (freeBed == null)
                throw new Exception("No free garden beds");

            user.FruitsBalance -= 1;
            freeBed.PlantedAt = DateTime.UtcNow;
            freeBed.TreeState = TreeState.Sprout;

            await _context.SaveChangesAsync();
        }
    }
}
