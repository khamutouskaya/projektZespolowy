using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalOS.Migrations
{
    /// <inheritdoc />
    public partial class AddPlannerModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "planner_tasks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    task_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    has_time = table.Column<bool>(type: "boolean", nullable: false),
                    reminder_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    icon = table.Column<string>(type: "text", nullable: true),
                    category = table.Column<string>(type: "text", nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    recurrence = table.Column<int>(type: "integer", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_planner_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_planner_tasks_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_planner_tasks_task_date",
                table: "planner_tasks",
                column: "task_date");

            migrationBuilder.CreateIndex(
                name: "IX_planner_tasks_user_id",
                table: "planner_tasks",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "planner_tasks");
        }
    }
}
