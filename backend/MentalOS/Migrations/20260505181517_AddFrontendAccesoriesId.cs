using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalOS.Migrations
{
    /// <inheritdoc />
    public partial class AddFrontendAccesoriesId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "accesories_id",
                table: "ShopItems",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "accesories_id",
                table: "ShopItems");
        }
    }
}
