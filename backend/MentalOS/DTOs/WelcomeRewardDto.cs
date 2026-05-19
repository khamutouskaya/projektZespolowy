namespace MentalOS.DTOs
{
    public class WelcomeRewardDto
    {
        public bool Granted { get; set; }
        public int CoinsAwarded { get; set; }
        public string RewardType { get; set; } = string.Empty;
    }
}
