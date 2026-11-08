using ControlGastos.Domain.Presupuestos;

namespace ControlGastos.Application.Presupuestos;

public interface IPresupuestoRepository
{
    Task<IReadOnlyList<Presupuesto>> ListarAsync(int anio, int mes, CancellationToken ct);
    Task<Presupuesto?> ObtenerAsync(Guid id, CancellationToken ct);
    Task<bool> ExisteAsync(int anio, int mes, Guid? categoriaId, CancellationToken ct);
    Task AgregarAsync(Presupuesto presupuesto, CancellationToken ct);
    Task ActualizarAsync(Presupuesto presupuesto, CancellationToken ct);
    Task<bool> EliminarAsync(Guid id, CancellationToken ct);
}
