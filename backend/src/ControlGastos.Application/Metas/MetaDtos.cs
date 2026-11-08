using System.ComponentModel.DataAnnotations;
using ControlGastos.Domain.Metas;

namespace ControlGastos.Application.Metas;

public sealed record GuardarMetaRequest : IValidatableObject
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Nombre { get; init; } = string.Empty;

    public decimal MontoObjetivo { get; init; }

    public DateOnly? FechaLimite { get; init; }

    [Required, StringLength(50)]
    public string Icono { get; init; } = "target";

    [Required, RegularExpression("^#[0-9a-fA-F]{6}$", ErrorMessage = "El color debe tener formato #RRGGBB.")]
    public string Color { get; init; } = "#4f46e5";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (MontoObjetivo <= 0)
            yield return new ValidationResult("El monto objetivo debe ser mayor a 0.", [nameof(MontoObjetivo)]);
        else if (decimal.Round(MontoObjetivo, 2) != MontoObjetivo)
            yield return new ValidationResult("El monto admite hasta 2 decimales.", [nameof(MontoObjetivo)]);
        else if (MontoObjetivo > 999_999_999_999m)
            yield return new ValidationResult("El monto es demasiado grande.", [nameof(MontoObjetivo)]);
    }
}

public sealed record RegistrarOperacionMetaRequest : IValidatableObject
{
    [EnumDataType(typeof(TipoOperacionMeta))]
    public TipoOperacionMeta Tipo { get; init; }

    public decimal Monto { get; init; }

    public DateOnly Fecha { get; init; }

    [StringLength(200)]
    public string? Nota { get; init; }

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
    }
}

public sealed record MetaDto(
    Guid Id,
    string Nombre,
    decimal MontoObjetivo,
    DateOnly? FechaLimite,
    string Icono,
    string Color,
    decimal Ahorrado,
    decimal Falta,
    decimal Porcentaje,
    bool Cumplida,
    DateTime? FechaCumplida,
    /// <summary>RF-MET-04: cuánto hay que ahorrar al mes para llegar a tiempo (null sin fecha límite o ya cumplida).</summary>
    decimal? AhorroMensualSugerido,
    bool Vencida);

public sealed record OperacionMetaDto(
    Guid Id,
    TipoOperacionMeta Tipo,
    decimal Monto,
    DateOnly Fecha,
    string? Nota);
