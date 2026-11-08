using ControlGastos.Domain.Categorias;

namespace ControlGastos.Application.Reportes;

public sealed record IngresosGastosMesDto(int Anio, int Mes, decimal Ingresos, decimal Gastos);

public sealed record PuntoMesDto(int Anio, int Mes, decimal Total);

public sealed record SerieCategoriaDto(
    Guid CategoriaId,
    string Nombre,
    TipoCategoria Tipo,
    string Color,
    IReadOnlyList<PuntoMesDto> Serie);

public sealed record ComparativoCategoriaDto(
    Guid CategoriaId,
    string Nombre,
    string Color,
    string Icono,
    decimal Actual,
    decimal Anterior,
    decimal Diferencia,
    /// <summary>Null cuando el mes anterior fue 0 (no hay base para calcular el porcentaje).</summary>
    decimal? VariacionPorcentaje);

public sealed record RankingCategoriaDto(
    Guid CategoriaId, string Nombre, string Color, string Icono, decimal Total, decimal Porcentaje);

/// <summary>Gasto de un mes por categoría, de mayor a menor; la primera es la que más gasto se llevó.</summary>
public sealed record RankingMesDto(int Anio, int Mes, decimal Total, IReadOnlyList<RankingCategoriaDto> Categorias);

public sealed record ComparativoMensualDto(
    int Anio,
    int Mes,
    decimal TotalActual,
    decimal TotalAnterior,
    decimal? VariacionPorcentaje,
    IReadOnlyList<ComparativoCategoriaDto> Categorias);
