using System.ComponentModel.DataAnnotations.Schema;

namespace MentalOS.Domain
{
    public enum PlannerTaskPriority
    {
        Normal,
        High
    }

    public enum PlannerTaskRecurrence
    {
        None,
        Daily,
        Weekly,
        Monthly,
        WorkDays,
        Custom
    }

    [Table("planner_tasks")]
    public class PlannerTask
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("user_id")]
        public Guid UserId { get; set; }
        
        public User? User { get; set; }

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("task_date")]
        public DateTime TaskDate { get; set; }

        [Column("has_time")]
        public bool HasTime { get; set; }

        [Column("reminder_time")]
        public DateTime? ReminderTime { get; set; }

        [Column("icon")]
        public string? Icon { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("priority")]
        public PlannerTaskPriority Priority { get; set; } = PlannerTaskPriority.Normal;

        [Column("recurrence")]
        public PlannerTaskRecurrence Recurrence { get; set; } = PlannerTaskRecurrence.None;

        [Column("is_completed")]
        public bool IsCompleted { get; set; } = false;

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("archived_at")]
        public DateTime? ArchivedAt { get; set; }
    }
}
