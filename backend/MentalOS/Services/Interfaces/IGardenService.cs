using MentalOS.Domain;
using MentalOS.DTOs;

namespace MentalOS.Services.Interfaces
{
    public interface IGardenService
    {
        Task PlantTreeAsync(Guid userId);
        Task<GardenStatusDto> GetGardenStatusAsync(Guid userId);
        Task<int> HarvestTreeAsync(Guid userId, Guid gardenBedId);
        Task ExchangeFruitAsync(Guid userId);
    }
}
