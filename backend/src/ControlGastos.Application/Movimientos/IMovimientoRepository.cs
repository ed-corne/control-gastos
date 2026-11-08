using ControlGastos.Domain.Movimientos;

namespace ControlGastos.Application.Movimientos;

public interface IMovimientoRepository
{
    Task<(IReadOnlyList<Movimiento> Items, int Total)> ListarAsync(FiltroMovimientos filtro, CancellationToken ct);
    Task<Movimiento?> ObtenerAsync(Guid id, CancellationToken ct);
    Task AgregarAsync(Movimiento movimiento, CancellationToken ct);
    Task ActualizarAsync(Movimiento movimiento, CancellationToken ct);
    Task<bool> EliminarAsync(Guid id, CancellationToken ct);

    /// <summary>Inserta varios movimientos en una sola operación (todo o nada).</summary>
    Task AgregarVariosAsync(IReadOnlyList<Movimiento> lista, CancellationToken ct);

    /// <summary>Claves (fecha, monto, cuenta) de los ingresos y gastos existentes, para detectar duplicados al importar.</summary>
    Task<HashSet<(DateOnly Fecha, decimal Monto, Guid CuentaId)>> ObtenerClavesAsync(
        DateOnly desde, DateOnly hasta, CancellationToken ct);

    /// <summary>Total por categoría de los ingresos o gastos del periodo (las transferencias no cuentan).</summary>
    Task<IReadOnlyDictionary<Guid, decimal>> TotalesPorCategoriaAsync(
        TipoMovimiento tipo, DateOnly desde, DateOnly hasta, CancellationToken ct);

    /// <summary>Total por mes (año, mes) de ingresos o gastos, opcionalmente de una sola categoría.</summary>
    Task<IReadOnlyDictionary<(int Anio, int Mes), decimal>> TotalesPorMesAsync(
        TipoMovimiento tipo, DateOnly desde, DateOnly hasta, Guid? categoriaId, CancellationToken ct);

    Task<Guid?> UltimaCuentaUsadaAsync(CancellationToken ct);
    Task<IReadOnlyList<Guid>> CategoriasFrecuentesAsync(TipoMovimiento tipo, int cantidad, CancellationToken ct);
}
