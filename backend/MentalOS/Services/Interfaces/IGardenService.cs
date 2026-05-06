using MentalOS.Domain;

namespace MentalOS.Services.Interfaces
{
    public interface IGardenService
    {
        Task PlantTreeAsync(Guid userId);
        Task<List<GardenBedDto>> GetGardenStatusAsync(Guid userId);
        Task HarvestTreeAsync(Guid userId, Guid gardenBedId);
    }
}
