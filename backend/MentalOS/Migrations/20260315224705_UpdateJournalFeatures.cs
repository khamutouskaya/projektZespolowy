using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalOS.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJournalFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "emotions",
                table: "journal_entries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "entry_date",
                table: "journal_entries",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "is_summary",
                table: "journal_entries",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "emotions",
                table: "journal_entries");

            migrationBuilder.DropColumn(
                name: "entry_date",
                table: "journal_entries");

            migrationBuilder.DropColumn(
                name: "is_summary",
                table: "journal_entries");
        }
    }
}
