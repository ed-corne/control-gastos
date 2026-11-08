using System.ComponentModel.DataAnnotations;
using ControlGastos.Domain.Presupuestos;

namespace ControlGastos.Application.Presupuestos;

public sealed record GuardarPresupuestoRequest : IValidatableObject
{
    /// <summary>Null = presupuesto global.</summary>
    public Guid? CategoriaId { get; init; }

    [Range(2000, 2100)]
    public int Anio { get; init; }

    [Range(1, 12)]
    public int Mes { get; init; }

    public decimal Monto { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Monto <= 0)
            yield return new ValidationResult("El monto debe ser mayor a 0.", [nameof(Monto)]);
        else if (decimal.Round(Monto, 2) != Monto)
            yield return new ValidationResult("El monto admite hasta 2 decimales.", [nameof(Monto)]);
        else if (Monto > 999_999_999_999m)
            yield return new ValidationResult("El monto es demasiado grande.", [nameof(Monto)]);
    }
}

public sealed record ActualizarPresupuestoRequest : IValidatableObject
{
    public decimal Monto { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Monto <= 0)
            yield return new ValidationResult("El monto debe ser mayor a 0.", [nameof(Monto)]);
        else if (decimal.Round(Monto, 2) != Monto)
            yield return new ValidationResult("El monto admite hasta 2 decimales.", [nameof(Monto)]);
        else if (Monto > 999_999_999_999m)
            yield return new ValidationResult("El monto es demasiado grande.", [nameof(Monto)]);
    }
}

public sealed record PresupuestoDto(
    Guid Id,
    Guid? CategoriaId,
    string CategoriaNombre,
    string? CategoriaColor,
    string? CategoriaIcono,
    string? CategoriaComentario,
    int Anio,
    int Mes,
    decimal Asignado,
    decimal Gastado,
    decimal Restante,
    decimal Porcentaje,
    EstadoPresupuesto Estado);
