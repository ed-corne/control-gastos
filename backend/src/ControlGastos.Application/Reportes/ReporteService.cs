using ControlGastos.Application.Categorias;
using ControlGastos.Application.Common;
using ControlGastos.Application.Movimientos;
using ControlGastos.Domain.Movimientos;
using ControlGastos.Domain.Categorias;

namespace ControlGastos.Application.Reportes;

public class ReporteService(IMovimientoRepository movimientos, ICategoriaRepository categorias)
{
    private const int MesesMaximos = 24;

    /// <summary>RF-REP-01: ingresos contra gastos de los últimos N meses (incluye el actual).</summary>
    public async Task<IReadOnlyList<IngresosGastosMesDto>> IngresosContraGastosAsync(int meses, CancellationToken ct)
    {
        var (desde, hasta, lista) = Rango(meses);

        var ingresos = await movimientos.TotalesPorMesAsync(TipoMovimiento.Ingreso, desde, hasta, null, ct);
        var gastos = await movimientos.TotalesPorMesAsync(TipoMovimiento.Gasto, desde, hasta, null, ct);

        return lista
            .Select(m => new IngresosGastosMesDto(
                m.Year, m.Month,
                ingresos.GetValueOrDefault((m.Year, m.Month)),
                gastos.GetValueOrDefault((m.Year, m.Month))))
            .ToList();
    }

    /// <summary>RF-REP-02: evolución mes a mes de una categoría.</summary>
    public async Task<SerieCategoriaDto?> SerieDeCategoriaAsync(Guid categoriaId, int meses, CancellationToken ct)
    {
        var categoria = await categorias.ObtenerAsync(categoriaId, ct);
        if (categoria is null) return null;

        var tipo = categoria.Tipo == TipoCategoria.Gasto ? TipoMovimiento.Gasto : TipoMovimiento.Ingreso;
        var (desde, hasta, lista) = Rango(meses);
        var totales = await movimientos.TotalesPorMesAsync(tipo, desde, hasta, categoriaId, ct);

        var serie = lista
            .Select(m => new PuntoMesDto(m.Year, m.Month, totales.GetValueOrDefault((m.Year, m.Month))))
            .ToList();

        return new SerieCategoriaDto(categoria.Id, categoria.Nombre, categoria.Tipo, categoria.Color, serie);
    }

    /// <summary>RF-REP-03: gasto del mes contra el mes anterior, por categoría y en porcentaje.</summary>
    public async Task<ComparativoMensualDto> CompararMesesAsync(int anio, int mes, CancellationToken ct)
    {
        if (anio is < 2000 or > 2100 || mes is < 1 or > 12)
            throw new ReglaNegocioException("El periodo indicado no es válido.");

        var actual = new DateOnly(anio, mes, 1);
        var anterior = actual.AddMonths(-1);

        var gastosActual = await movimientos.TotalesPorCategoriaAsync(
            TipoMovimiento.Gasto, actual, actual.AddMonths(1).AddDays(-1), ct);
        var gastosAnterior = await movimientos.TotalesPorCategoriaAsync(
            TipoMovimiento.Gasto, anterior, actual.AddDays(-1), ct);

        var porCategoria = (await categorias.ListarAsync(null, true, ct)).ToDictionary(c => c.Id);

        var filas = gastosActual.Keys.Union(gastosAnterior.Keys)
            .Where(porCategoria.ContainsKey)
            .Select(id =>
            {
                var c = porCategoria[id];
                var a = gastosActual.GetValueOrDefault(id);
                var p = gastosAnterior.GetValueOrDefault(id);
                return new ComparativoCategoriaDto(c.Id, c.Nombre, c.Color, c.Icono, a, p, a - p, Variacion(a, p));
            })
            .OrderByDescending(f => f.Actual).ThenByDescending(f => f.Anterior)
            .ToList();

        var totalActual = gastosActual.Values.Sum();
        var totalAnterior = gastosAnterior.Values.Sum();

        return new ComparativoMensualDto(anio, mes, totalActual, totalAnterior, Variacion(totalActual, totalAnterior), filas);
    }

    private static decimal? Variacion(decimal actual, decimal anterior) =>
        anterior == 0 ? null : decimal.Round((actual - anterior) / anterior * 100, 1);

    private static (DateOnly Desde, DateOnly Hasta, List<DateOnly> Meses) Rango(int meses)
    {
        meses = Math.Clamp(meses, 1, MesesMaximos);
        var hoy = DateOnly.FromDateTime(DateTime.Now);
        var mesActual = new DateOnly(hoy.Year, hoy.Month, 1);

        var lista = Enumerable.Range(0, meses)
            .Select(i => mesActual.AddMonths(-(meses - 1 - i)))
            .ToList();

        return (lista[0], mesActual.AddMonths(1).AddDays(-1), lista);
    }
}
