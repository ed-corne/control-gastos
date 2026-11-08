using System.ComponentModel.DataAnnotations;
using ControlGastos.Domain.Movimientos;

namespace ControlGastos.Application.Movimientos;

public sealed record GuardarMovimientoRequest : IValidatableObject
{
    [EnumDataType(typeof(TipoMovimiento))]
    public TipoMovimiento Tipo { get; init; }

    public decimal Monto { get; init; }

    public DateOnly Fecha { get; init; }

    [StringLength(500)]
    public string? Descripcion { get; init; }

    public Guid CuentaId { get; init; }
    public Guid? CuentaDestinoId { get; init; }
    public Guid? CategoriaId { get; init; }

    // RF-MOV-07
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Monto <= 0)
            yield return new ValidationResult("El monto debe ser mayor a 0.", [nameof(Monto)]);
        else if (decimal.Round(Monto, 2) != Monto)
            yield return new ValidationResult("El monto admite hasta 2 decimales.", [nameof(Monto)]);
        else if (Monto > 999_999_999_999m)
            yield return new ValidationResult("El monto es demasiado grande.", [nameof(Monto)]);

        if (Fecha > DateOnly.FromDateTime(DateTime.Now))
            yield return new ValidationResult("La fecha no puede ser posterior a hoy.", [nameof(Fecha)]);

        if (CuentaId == Guid.Empty)
            yield return new ValidationResult("La cuenta es obligatoria.", [nameof(CuentaId)]);

        if (Tipo == TipoMovimiento.Transferencia)
        {
            if (CuentaDestinoId is null || CuentaDestinoId == Guid.Empty)
                yield return new ValidationResult("La cuenta destino es obligatoria.", [nameof(CuentaDestinoId)]);
            else if (CuentaDestinoId == CuentaId)
                yield return new ValidationResult("La cuenta destino debe ser distinta de la de origen.", [nameof(CuentaDestinoId)]);
        }
        else if (CategoriaId is null || CategoriaId == Guid.Empty)
        {
            yield return new ValidationResult("La categoría es obligatoria.", [nameof(CategoriaId)]);
        }
    }
}

public sealed record MovimientoDto(
    Guid Id,
    TipoMovimiento Tipo,
    decimal Monto,
    DateOnly Fecha,
    string? Descripcion,
    Guid CuentaId,
    string CuentaNombre,
    Guid? CuentaDestinoId,
    string? CuentaDestinoNombre,
    Guid? CategoriaId,
    string? CategoriaNombre,
    string? CategoriaColor,
    string? CategoriaIcono);

public sealed record SugerenciasMovimientoDto(
    Guid? UltimaCuentaId,
    IReadOnlyList<Guid> CategoriasGastoFrecuentes,
    IReadOnlyList<Guid> CategoriasIngresoFrecuentes);

public sealed record FiltroMovimientos
{
    public DateOnly? Desde { get; init; }
    public DateOnly? Hasta { get; init; }
    public TipoMovimiento? Tipo { get; init; }
    public Guid? CategoriaId { get; init; }
    public Guid? CuentaId { get; init; }
    public decimal? MontoMin { get; init; }
    public decimal? MontoMax { get; init; }
    public string? Texto { get; init; }
    public int Pagina { get; init; } = 1;
    public int Tamano { get; init; } = 30;
}
