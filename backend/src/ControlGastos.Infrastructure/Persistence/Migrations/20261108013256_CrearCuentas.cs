using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControlGastos.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CrearCuentas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cuentas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SaldoInicial = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    Icono = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Archivada = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cuentas", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cuentas_Archivada",
                table: "cuentas",
                column: "Archivada");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cuentas");
        }
    }
}
