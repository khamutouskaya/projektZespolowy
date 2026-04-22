using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalOS.Migrations
{
    /// <inheritdoc />
    public partial class Shop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_StreakHistories",
                table: "StreakHistories");

            migrationBuilder.RenameTable(
                name: "StreakHistories",
                newName: "streak_history");

            migrationBuilder.RenameIndex(
                name: "IX_StreakHistories_user_id",
                table: "streak_history",
                newName: "IX_streak_history_user_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_streak_history",
                table: "streak_history",
                column: "id");

            migrationBuilder.CreateTable(
                name: "coin_transaction",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    amount = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    balance_after = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_coin_transaction", x => x.id);
                    table.ForeignKey(
                        name: "FK_coin_transaction_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShopItems",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    price = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopItems", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_item",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    shop_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    purchased_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_item", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_item_ShopItems_id",
                        column: x => x.id,
                        principalTable: "ShopItems",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_item_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_coin_transaction_user_id",
                table: "coin_transaction",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_item_user_id_id",
                table: "user_item",
                columns: new[] { "user_id", "id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "coin_transaction");

            migrationBuilder.DropTable(
                name: "user_item");

            migrationBuilder.DropTable(
                name: "ShopItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_streak_history",
                table: "streak_history");

            migrationBuilder.RenameTable(
                name: "streak_history",
                newName: "StreakHistories");

            migrationBuilder.RenameIndex(
                name: "IX_streak_history_user_id",
                table: "StreakHistories",
                newName: "IX_StreakHistories_user_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StreakHistories",
                table: "StreakHistories",
                column: "id");
        }
    }
}
