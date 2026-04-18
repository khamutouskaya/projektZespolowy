using MentalOS.Data;
using MentalOS.Domain;
using MentalOS.DTOs.PlannerDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MentalOS.Controllers
{
    [ApiController]
    [Route("api/planner")]
    [Authorize]
    public class PlannerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlannerController(AppDbContext context)
        {
            _context = context;
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return null;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { message = "User is unauthorized" });

            var tasks = await _context.PlannerTasks
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.TaskDate)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("daily")]
        public async Task<IActionResult> GetDailyTasks([FromQuery] DateTime date)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var startOfDay = date.Date.ToUniversalTime();
            var endOfDay = startOfDay.AddDays(1);

            var tasks = await _context.PlannerTasks
                .Where(t => t.UserId == userId && t.TaskDate >= startOfDay && t.TaskDate < endOfDay)
                .OrderBy(t => t.TaskDate)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeeklyTasks([FromQuery] DateTime startDate)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var startOfWeek = startDate.Date.ToUniversalTime();
            var endOfWeek = startOfWeek.AddDays(7);

            var tasks = await _context.PlannerTasks
                .Where(t => t.UserId == userId && t.TaskDate >= startOfWeek && t.TaskDate < endOfWeek)
                .OrderBy(t => t.TaskDate)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthlyTasks([FromQuery] int year, [FromQuery] int month)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var startOfMonth = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfMonth = startOfMonth.AddMonths(1);

            var tasks = await _context.PlannerTasks
                .Where(t => t.UserId == userId && t.TaskDate >= startOfMonth && t.TaskDate < endOfMonth)
                .OrderBy(t => t.TaskDate)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(Guid id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var task = await _context.PlannerTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound();

            return Ok(MapToDto(task));
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreatePlannerTaskDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var task = new PlannerTask
            {
                UserId = userId.Value,
                Title = dto.Title,
                Description = dto.Description,
                TaskDate = dto.TaskDate,
                HasTime = dto.HasTime,
                ReminderTime = dto.ReminderTime,
                Icon = dto.Icon,
                Category = dto.Category,
                Priority = dto.Priority,
                Recurrence = dto.Recurrence,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PlannerTasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, MapToDto(task));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdatePlannerTaskDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var task = await _context.PlannerTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound();

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.TaskDate = dto.TaskDate;
            task.HasTime = dto.HasTime;
            task.ReminderTime = dto.ReminderTime;
            task.Icon = dto.Icon;
            task.Category = dto.Category;
            task.Priority = dto.Priority;
            task.Recurrence = dto.Recurrence;

            if (task.IsCompleted != dto.IsCompleted)
            {
                task.IsCompleted = dto.IsCompleted;
                task.CompletedAt = dto.IsCompleted ? DateTime.UtcNow : null;
            }

            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapToDto(task));
        }

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> ToggleComplete(Guid id, [FromQuery] bool isCompleted)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var task = await _context.PlannerTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound();

            task.IsCompleted = isCompleted;
            task.CompletedAt = isCompleted ? DateTime.UtcNow : null;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapToDto(task));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var task = await _context.PlannerTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return NotFound();

            _context.PlannerTasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task deleted successfully" });
        }

        private static PlannerTaskDto MapToDto(PlannerTask task)
        {
            return new PlannerTaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                TaskDate = task.TaskDate,
                HasTime = task.HasTime,
                ReminderTime = task.ReminderTime,
                Icon = task.Icon,
                Category = task.Category,
                Priority = task.Priority,
                Recurrence = task.Recurrence,
                IsCompleted = task.IsCompleted,
                CompletedAt = task.CompletedAt,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };
        }
    }
}