using System.ComponentModel.DataAnnotations.Schema;

namespace MentalOS.Domain
{
    public class StreakHistory
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("action")]
        public string Action { get; set; } = string.Empty;

        [Column("streak_value")]
        public int StreakValue { get; set; }

        [Column("balance_after")]
        public int BalanceAfter { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
