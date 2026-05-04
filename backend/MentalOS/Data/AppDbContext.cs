using Microsoft.EntityFrameworkCore;
using MentalOS.Domain;
using Org.BouncyCastle.Bcpg.OpenPgp;

namespace MentalOS.Data
{
    /// <summary>
    /// Kontekst bazy danych - PostgreSQL z EF Core
    /// Tabele: users, roles, user_roles, personality_profiles
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<PersonalityProfile> PersonalityProfiles => Set<PersonalityProfile>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

        public DbSet<ChatSession> ChatSessions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
        public DbSet<PlannerTask> PlannerTasks => Set<PlannerTask>();

        // Streak + shop
        public DbSet<StreakHistory> StreakHistories { get; set; }
        public DbSet<ShopItem> ShopItems { get; set; }
        public DbSet<UserItem> UserItems { get; set; }
        public DbSet<CoinTransaction> CoinTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => new { e.Provider, e.ProviderUserId }).IsUnique();

                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.Provider).IsRequired();
            });

            modelBuilder.Entity<PersonalityProfile>(entity =>
            {
                entity.ToTable("personality_profiles");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("roles");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // UserRole configuration
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.ToTable("user_roles");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Role)
                      .WithMany()
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Globalne filtry zapytań (Global Query Filters) dla "Miękkiego usuwania" - nie psuje to istniejących zapytań
            modelBuilder.Entity<User>().HasQueryFilter(u => u.DeletedAt == null);
            modelBuilder.Entity<JournalEntry>().HasQueryFilter(j => !j.IsDeleted);
            modelBuilder.Entity<PlannerTask>().HasQueryFilter(p => !p.IsDeleted);

            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.ToTable("password_reset_tokens");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.TokenHash)
                      .IsRequired()
                      .HasMaxLength(64); // SHA-256 hash length

                entity.Property(e => e.CreatedAt)
                      .IsRequired();

                entity.Property(e => e.ExpiresAt)
                      .IsRequired();

                entity.HasOne(e => e.User)
                      .WithMany() // 
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TokenHash)
                      .IsUnique();

                entity.HasIndex(e => e.UserId);
            });


            modelBuilder.Entity<StreakHistory>()
                .ToTable("streak_history")
                .HasIndex(s => s.UserId);

            modelBuilder.Entity<UserItem>()
                .ToTable("user_item")
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(u => u.UserId);

            modelBuilder.Entity<UserItem>()
                .ToTable("user_item")
                .HasOne<ShopItem>()
                .WithMany()
                .HasForeignKey(item => item.ShopItemId);
            
            modelBuilder.Entity<CoinTransaction>()
                .ToTable("coin_transaction")
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(u => u.UserId);

            modelBuilder.Entity<UserItem>()
                .HasIndex(item => new { item.UserId, item.ShopItemId })
                .IsUnique();

            modelBuilder.Entity<ChatSession>()
                .ToTable("chat_sessions")
                .HasKey(cs => cs.Id);

            modelBuilder.Entity<ChatMessage>()
                .ToTable("chat_messages")
                .HasKey(cm => cm.Id);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.Session)
                .WithMany(cs => cs.Messages)
                .HasForeignKey(cm => cm.SessionId);

            modelBuilder.Entity<JournalEntry>(entity =>
            {
                entity.ToTable("journal_entries");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => e.UserId);
            });

            modelBuilder.Entity<PlannerTask>(entity =>
            {
                entity.ToTable("planner_tasks");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.TaskDate); // for fast daily/weekly queries
            });
        }
    }
}
