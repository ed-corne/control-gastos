using ControlGastos.Application.Movimientos;
using ControlGastos.Application.Presupuestos;

namespace ControlGastos.Application.Dashboard;

public sealed record GastoCategoriaDto(
    Guid CategoriaId,
    string Nombre,
    string Color,
    string Icono,
    decimal Total,
    decimal Porcentaje);

public sealed record DashboardDto(
    DateOnly Desde,
    DateOnly Hasta,
    decimal SaldoTotal,
    decimal Ingresos,
    decimal Gastos,
    decimal Balance,
    IReadOnlyList<GastoCategoriaDto> GastosPorCategoria,
    IReadOnlyList<MovimientoDto> UltimosMovimientos,
    IReadOnlyList<PresupuestoDto> PresupuestosEnRiesgo);
