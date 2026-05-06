namespace MentalOS.Domain
{
    public class PersonalityQuestion
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string Trait { get; set; } // O, C, E, A, N
        public bool Reverse { get; set; }
    }
}
