using System.ComponentModel.DataAnnotations.Schema;

namespace MentalOS.Domain
{
    /// <summary>
    /// Profil osobowoœci - przechowuje typ osobowoœci i cechy u¿ytkownika (format JSON)
    /// Typy: supportive, balanced, direct
    /// </summary>
    [Table("personality_profiles")]
    public class PersonalityProfile
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Column("user_id")]
        public Guid UserId { get; set; }
        
        [Column("personality_type")]
        public string PersonalityType { get; set; } = string.Empty;
        
        [Column("traits")]
        public string? Traits { get; set; }
        
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
        
        public User? User { get; set; }
    }
}
