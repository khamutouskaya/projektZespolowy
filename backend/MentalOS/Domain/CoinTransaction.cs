using System.ComponentModel.DataAnnotations.Schema;

namespace MentalOS.Domain
{
    public class CoinTransaction
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();


        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("amount")]
        public int Amount { get; set; }

        [Column("reason")]
        public string Reason { get; set; } = string.Empty;

        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Column("balance_after")]
        public int BalanceAfter { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
