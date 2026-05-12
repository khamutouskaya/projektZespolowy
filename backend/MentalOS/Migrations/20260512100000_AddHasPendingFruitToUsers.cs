using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalOS.Migrations
{
    public partial class AddHasPendingFruitToUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "has_pending_fruit",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "has_pending_fruit",
                table: "users");
        }
    }
}
