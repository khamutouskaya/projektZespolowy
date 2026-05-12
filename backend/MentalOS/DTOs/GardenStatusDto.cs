namespace MentalOS.DTOs
{
    public class GardenStatusDto
    {
        public List<GardenBedDto> Beds { get; set; } = new();
        public int FruitsBalance { get; set; }
    }
}
