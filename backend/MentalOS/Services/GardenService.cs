using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

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

            //var days = (DateTime.UtcNow - bed.PlantedAt.Value).TotalDays;

            //if (days < 1)
            //    bed.TreeState = TreeState.Sprout;
            //else if (days < 2)
            //    bed.TreeState = TreeState.Sapling;
            //else if (days < 3)
            //    bed.TreeState = TreeState.Mature;
            //else
            //    bed.TreeState = TreeState.Fruiting;


            var sec = (DateTime.UtcNow - bed.PlantedAt.Value).TotalSeconds;
            if (sec < 5)
                bed.TreeState = TreeState.Sprout;
            else if (sec < 10)
                bed.TreeState = TreeState.Sapling;
            else if (sec < 15)
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

        public async Task<List<GardenBedDto>> GetGardenStatusAsync(Guid userId)
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

            var result = beds.Select(b => new GardenBedDto
            {
                Id = b.Id,
                TreeState = b.TreeState,
                X = b.X,
                Y = b.Y
            }).ToList();

            return result;
        }

        public async Task HarvestTreeAsync(Guid userId, Guid gardenBedId)
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

            _streakService.AddBalance(user, user.StreakCount * 3, "harvest").Wait();


            bed.TreeState = TreeState.Empty;
            bed.PlantedAt = null;

            await _context.SaveChangesAsync();
        }

        public async Task PlantTreeAsync(Guid userId)
        {
            var garden = await _context.Gardens
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (garden == null)
                throw new Exception("Garden not found");

            var beds = await _context.GardenBeds
                .Where(b => b.GardenId == garden.Id)
                .ToListAsync();

            foreach (var bed in beds)
            {
                UpdateBedState(bed);
            }

            var freeBed = beds.FirstOrDefault(b => b.TreeState == TreeState.Empty);

            if (freeBed == null)
                throw new Exception("No free garden beds");

            if (freeBed.TreeState != TreeState.Empty)
                throw new Exception("Bed already taken");

            freeBed.PlantedAt = DateTime.UtcNow;
            freeBed.TreeState = TreeState.Sprout;

            await _context.SaveChangesAsync();
        }
    }


    public class GardenBedDto
    {
        public Guid Id { get; set; }
        public TreeState TreeState { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
    }
}
