using ControlGastos.Domain.Cuentas;

namespace ControlGastos.Application.Cuentas;

public interface ICuentaRepository
{
    Task<IReadOnlyList<Cuenta>> ListarAsync(bool incluirArchivadas, CancellationToken ct);
    Task<Cuenta?> ObtenerAsync(Guid id, CancellationToken ct);
    Task AgregarAsync(Cuenta cuenta, CancellationToken ct);
    Task GuardarCambiosAsync(CancellationToken ct);
}
