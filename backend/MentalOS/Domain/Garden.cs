namespace MentalOS.Domain
{
    public class Garden
    {
        public Guid Id { get; set; }

        public Guid UserId {  get; set; }

        public List<GardenBed> GardenBeds { get; set; } = new();
    }
}
