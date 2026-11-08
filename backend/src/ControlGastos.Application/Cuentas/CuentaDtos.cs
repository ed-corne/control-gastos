using System.ComponentModel.DataAnnotations;
using ControlGastos.Domain.Cuentas;

namespace ControlGastos.Application.Cuentas;

public sealed record GuardarCuentaRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Nombre { get; init; } = string.Empty;

    [EnumDataType(typeof(TipoCuenta))]
    public TipoCuenta Tipo { get; init; }

    [Range(typeof(decimal), "-999999999999", "999999999999")]
    public decimal SaldoInicial { get; init; }

    [Required, RegularExpression("^#[0-9a-fA-F]{6}$", ErrorMessage = "El color debe tener formato #RRGGBB.")]
    public string Color { get; init; } = "#4f46e5";

    [Required, StringLength(50)]
    public string Icono { get; init; } = "wallet";
}

public sealed record CuentaDto(
    Guid Id,
    string Nombre,
    TipoCuenta Tipo,
    decimal SaldoInicial,
    decimal SaldoActual,
    string Color,
    string Icono,
    bool Archivada);

public sealed record ResumenCuentasDto(
    decimal SaldoTotal,
    decimal TotalActivos,
    decimal TotalDeudaTarjetas,
    int CuentasActivas);
