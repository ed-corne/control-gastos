using ControlGastos.Domain.Cuentas;

namespace ControlGastos.Application.Cuentas;

public interface ICuentaRepository
{
    Task<IReadOnlyList<Cuenta>> ListarAsync(bool incluirArchivadas, CancellationToken ct);
    Task<Cuenta?> ObtenerAsync(Guid id, CancellationToken ct);
    Task AgregarAsync(Cuenta cuenta, CancellationToken ct);
    Task ActualizarAsync(Cuenta cuenta, CancellationToken ct);
    Task EliminarAsync(Guid id, CancellationToken ct);
    Task<bool> ExisteNombreAsync(string nombre, Guid? excluirId, CancellationToken ct);
    Task<bool> TieneMovimientosAsync(Guid id, CancellationToken ct);

    /// <summary>
    /// Efecto neto de los movimientos por cuenta: ingresos − gastos − transferencias enviadas + transferencias recibidas.
    /// </summary>
    Task<IReadOnlyDictionary<Guid, decimal>> ObtenerMovimientoNetoAsync(CancellationToken ct);
}
