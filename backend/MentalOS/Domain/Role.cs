using System.ComponentModel.DataAnnotations.Schema;

namespace MentalOS.Domain
{
    /// <summary>
    /// Encja roli - definiuje uprawnienia u¿ytkownika (user, admin, specialist)
    /// </summary>
    [Table("roles")]
    public class Role
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Column("name")]
        public string Name { get; set; } = string.Empty;
        
        [Column("description")]
        public string? Description { get; set; }
        
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
    }
    
    /// <summary>
    /// Tabela ³¹cz¹ca - przypisuje role u¿ytkownikom
    /// </summary>
    [Table("user_roles")]
    public class UserRole
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Column("user_id")]
        public Guid UserId { get; set; }
        
        [Column("role_id")]
        public Guid RoleId { get; set; }
        
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
        
        // Navigation
        public User? User { get; set; }
        public Role? Role { get; set; }
    }
}
