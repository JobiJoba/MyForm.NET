using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyForm.FormApi.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Forms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                comment: "The last name of the form submitter",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Forms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                comment: "The first name of the form submitter",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Forms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                comment: "Timestamp when the form was created");

            migrationBuilder.CreateIndex(
                name: "IX_Forms_CreatedAt",
                table: "Forms",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Forms_FirstName_LastName",
                table: "Forms",
                columns: new[] { "FirstName", "LastName" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Forms_CreatedAt",
                table: "Forms");

            migrationBuilder.DropIndex(
                name: "IX_Forms_FirstName_LastName",
                table: "Forms");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Forms");

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Forms",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldComment: "The last name of the form submitter");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Forms",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldComment: "The first name of the form submitter");
        }
    }
}
