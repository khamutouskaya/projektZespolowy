namespace MentalOS.DTOs
{
    public sealed class UserDataDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Avatar { get; set; }
        public int StreakCount { get; set; }
        public bool StreakActive { get; set; }
        public int CoinsBalance { get; set; }
        public bool IsPremium { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public sealed class UpdateUserDataDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Avatar { get; set; }
    }
}
