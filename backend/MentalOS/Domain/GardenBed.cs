namespace MentalOS.Domain
{
    public class GardenBed
    {
        public Guid Id { get; set; }
        public Guid GardenId { get; set; }
        public Garden? Garden { get; set; }
        public TreeState TreeState { get; set; } = TreeState.Empty;
        public DateTime? PlantedAt { get; set; }

        public int X { get; set; }
        public int Y { get; set; } 
    }

    public enum TreeState
    {
        Empty,
        Sprout,
        Sapling,
        Mature,
        Fruiting
    }
}
