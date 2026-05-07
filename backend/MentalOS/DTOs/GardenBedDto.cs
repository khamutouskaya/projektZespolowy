using MentalOS.Domain;

namespace MentalOS.DTOs
{
    public class GardenBedDto
    {
        public Guid Id { get; set; }
        public TreeState TreeState { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
    }
}
