using MentalOS.Domain;

namespace MentalOS.DTOs.PlannerDTOs
{
    public class PlannerTaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime TaskDate { get; set; }
        public bool HasTime { get; set; }
        public DateTime? ReminderTime { get; set; }
        public string? Icon { get; set; }
        public string? Category { get; set; }
        public PlannerTaskPriority Priority { get; set; }
        public PlannerTaskRecurrence Recurrence { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreatePlannerTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime TaskDate { get; set; }
        public bool HasTime { get; set; }
        public DateTime? ReminderTime { get; set; }
        public string? Icon { get; set; }
        public string? Category { get; set; }
        public PlannerTaskPriority Priority { get; set; } = PlannerTaskPriority.Normal;
        public PlannerTaskRecurrence Recurrence { get; set; } = PlannerTaskRecurrence.None;
    }

    public class UpdatePlannerTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime TaskDate { get; set; }
        public bool HasTime { get; set; }
        public DateTime? ReminderTime { get; set; }
        public string? Icon { get; set; }
        public string? Category { get; set; }
        public PlannerTaskPriority Priority { get; set; } = PlannerTaskPriority.Normal;
        public PlannerTaskRecurrence Recurrence { get; set; } = PlannerTaskRecurrence.None;
        public bool IsCompleted { get; set; }
    }
}