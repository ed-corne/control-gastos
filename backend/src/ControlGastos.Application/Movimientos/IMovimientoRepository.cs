using ControlGastos.Domain.Movimientos;

namespace ControlGastos.Application.Movimientos;

public interface IMovimientoRepository
{
    Task<(IReadOnlyList<Movimiento> Items, int Total)> ListarAsync(FiltroMovimientos filtro, CancellationToken ct);
    Task<Movimiento?> ObtenerAsync(Guid id, CancellationToken ct);
    Task AgregarAsync(Movimiento movimiento, CancellationToken ct);
    Task ActualizarAsync(Movimiento movimiento, CancellationToken ct);
    Task<bool> EliminarAsync(Guid id, CancellationToken ct);

    Task<Guid?> UltimaCuentaUsadaAsync(CancellationToken ct);
    Task<IReadOnlyList<Guid>> CategoriasFrecuentesAsync(TipoMovimiento tipo, int cantidad, CancellationToken ct);
}
