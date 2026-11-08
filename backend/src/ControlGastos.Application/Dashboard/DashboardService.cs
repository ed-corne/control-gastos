using ControlGastos.Application.Categorias;
using ControlGastos.Application.Common;
using ControlGastos.Application.Configuraciones;
using ControlGastos.Application.Cuentas;
using ControlGastos.Application.Movimientos;
using ControlGastos.Application.Presupuestos;
using ControlGastos.Domain.Configuraciones;
using ControlGastos.Domain.Movimientos;

namespace ControlGastos.Application.Dashboard;

public class DashboardService(
    CuentaService cuentas,
    MovimientoService movimientosService,
    IMovimientoRepository movimientos,
    ICategoriaRepository categorias,
    PresupuestoService presupuestos,
    RelojService reloj)
{
    /// <summary>
    /// RF-DSH-01 a 04: resumen del periodo (por defecto el mes actual).
    /// </summary>
    public async Task<DashboardDto> ObtenerAsync(
        DateOnly? desde, DateOnly? hasta, bool mesAnterior, CancellationToken ct)
    {
        var hoy = await reloj.HoyAsync(ct);
        var dia = await reloj.DiaInicioMesAsync(ct);

        // Sin fechas: el mes financiero actual (o el anterior), según el día de inicio configurado.
        var (inicio, fin) = (desde, hasta) switch
        {
            (null, null) => PeriodoFinanciero(hoy, dia, mesAnterior),
            _ => (desde ?? PeriodoFinanciero(hoy, dia, false).Desde, hasta ?? PeriodoFinanciero(hoy, dia, false).Hasta),
        };

        if (inicio > fin)
            throw new ReglaNegocioException("La fecha inicial no puede ser posterior a la final.");

        var gastos = await movimientos.TotalesPorCategoriaAsync(TipoMovimiento.Gasto, inicio, fin, ct);
        var ingresos = await movimientos.TotalesPorCategoriaAsync(TipoMovimiento.Ingreso, inicio, fin, ct);
        var totalGastos = gastos.Values.Sum();
        var totalIngresos = ingresos.Values.Sum();

        var porCategoria = (await categorias.ListarAsync(null, true, ct)).ToDictionary(c => c.Id);

        // RF-DSH-02: gasto por categoría con monto y porcentaje.
        var gastosPorCategoria = gastos
            .Where(g => porCategoria.ContainsKey(g.Key))
            .OrderByDescending(g => g.Value)
            .Select(g =>
            {
                var c = porCategoria[g.Key];
                var porcentaje = totalGastos == 0 ? 0 : decimal.Round(g.Value / totalGastos * 100, 1);
                return new GastoCategoriaDto(c.Id, c.Nombre, c.Color, c.Icono, g.Value, porcentaje);
            })
            .ToList();

        var resumen = await cuentas.ObtenerResumenAsync(ct);

        // RF-DSH-03: últimos 5 movimientos y presupuestos que pasan del 75 % (mes del final del periodo).
        var ultimos = await movimientosService.ListarAsync(new FiltroMovimientos { Pagina = 1, Tamano = 5 }, ct);
        var (anioPres, mesPres) = Configuracion.MesFinancieroDe(fin > hoy ? hoy : fin, dia);
        var enRiesgo = (await presupuestos.ListarAsync(anioPres, mesPres, ct))
            .Where(p => p.Porcentaje >= 75)
            .OrderByDescending(p => p.Porcentaje)
            .ToList();

        return new DashboardDto(
            inicio, fin, resumen.SaldoTotal,
            totalIngresos, totalGastos, totalIngresos - totalGastos,
            gastosPorCategoria, ultimos.Items, enRiesgo);
    }

    private static (DateOnly Desde, DateOnly Hasta) PeriodoFinanciero(DateOnly hoy, int dia, bool anterior)
    {
        var (anio, mes) = Configuracion.MesFinancieroDe(hoy, dia);
        if (anterior)
        {
            var previo = new DateOnly(anio, mes, 1).AddMonths(-1);
            (anio, mes) = (previo.Year, previo.Month);
        }
        return Configuracion.Rango(anio, mes, dia);
    }
}
