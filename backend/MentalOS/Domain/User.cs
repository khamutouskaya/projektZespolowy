using System.ComponentModel.DataAnnotations.Schema;

namespace MentalOS.Domain
{
    /// <summary>
    /// Encja użytkownika - główne konto z danymi autoryzacji, gamifikacją i polami audytowymi
    /// </summary>
    [Table("users")]
    public class User
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Column("email")]
        public string Email { get; set; } = string.Empty;
        
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Column("first_name")]
        public string? FirstName { get; set; }
        
        [Column("last_name")]
        public string? LastName { get; set; }
        
        [Column("avatar")]
        public string? Avatar { get; set; }
        
        [Column("streak_count")]
        public int StreakCount { get; set; } = 0;
        
        [Column("streak_active")]
        public bool StreakActive { get; set; } = false;
        
        [Column("coins_balance")]
        public int CoinsBalance { get; set; } = 0;
        
        [Column("is_premium")]
        public bool IsPremium { get; set; } = false;
        
        // Standardowe pola audytowe do śledzenia zmian
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("created_by")]
        public Guid? CreatedBy { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("updated_by")]
        public Guid? UpdatedBy { get; set; }
        
        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
        
        [Column("deleted_by")]
        public Guid? DeletedBy { get; set; }
        
        // Właściwości nie przechowywane w bazie - używane w logice aplikacji i odpowiedziach API
        [NotMapped]
        public bool IsAdmin { get; set; }
        
        [NotMapped]
        public string PersonalityType { get; set; } = "unknown";
        
        [NotMapped]
        public string Provider { get; set; } = "local";
        
        [NotMapped]
        public string? ProviderUserId { get; set; }
    }
}