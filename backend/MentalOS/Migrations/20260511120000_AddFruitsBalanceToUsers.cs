using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalOS.Migrations
{
    public partial class AddFruitsBalanceToUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "fruits_balance",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fruits_balance",
                table: "users");
        }
    }
}
