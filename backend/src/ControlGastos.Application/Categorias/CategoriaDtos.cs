using System.ComponentModel.DataAnnotations;
using ControlGastos.Domain.Categorias;

namespace ControlGastos.Application.Categorias;

public sealed record GuardarCategoriaRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Nombre { get; init; } = string.Empty;

    [EnumDataType(typeof(TipoCategoria))]
    public TipoCategoria Tipo { get; init; }

    [Required, RegularExpression("^#[0-9a-fA-F]{6}$", ErrorMessage = "El color debe tener formato #RRGGBB.")]
    public string Color { get; init; } = "#6b7280";

    [Required, StringLength(50)]
    public string Icono { get; init; } = "other";
}

public sealed record CategoriaDto(
    Guid Id,
    string Nombre,
    TipoCategoria Tipo,
    string Color,
    string Icono,
    bool Archivada);
