using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalOS.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteAndArchiving : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_user_item_ShopItems_id",
                table: "user_item");

            migrationBuilder.DropIndex(
                name: "IX_user_item_user_id_id",
                table: "user_item");

            migrationBuilder.AddColumn<DateTime>(
                name: "archived_at",
                table: "planner_tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "planner_tasks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "archived_at",
                table: "journal_entries",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "journal_entries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_user_item_shop_item_id",
                table: "user_item",
                column: "shop_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_item_user_id_shop_item_id",
                table: "user_item",
                columns: new[] { "user_id", "shop_item_id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_user_item_ShopItems_shop_item_id",
                table: "user_item",
                column: "shop_item_id",
                principalTable: "ShopItems",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_user_item_ShopItems_shop_item_id",
                table: "user_item");

            migrationBuilder.DropIndex(
                name: "IX_user_item_shop_item_id",
                table: "user_item");

            migrationBuilder.DropIndex(
                name: "IX_user_item_user_id_shop_item_id",
                table: "user_item");

            migrationBuilder.DropColumn(
                name: "archived_at",
                table: "planner_tasks");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "planner_tasks");

            migrationBuilder.DropColumn(
                name: "archived_at",
                table: "journal_entries");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "journal_entries");

            migrationBuilder.CreateIndex(
                name: "IX_user_item_user_id_id",
                table: "user_item",
                columns: new[] { "user_id", "id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_user_item_ShopItems_id",
                table: "user_item",
                column: "id",
                principalTable: "ShopItems",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
