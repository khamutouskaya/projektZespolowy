using System.ComponentModel.DataAnnotations.Schema;

namespace MentalOS.Domain
{
    public class UserItem
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("shop_item_id")]
        public Guid ShopItemId { get; set; }

        [Column("purchased_at")]
        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
