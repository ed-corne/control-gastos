using ControlGastos.Domain.Configuraciones;

namespace ControlGastos.Application.Configuraciones;

public interface IConfiguracionRepository
{
    Task<Configuracion> ObtenerAsync(CancellationToken ct);
    Task GuardarAsync(Configuracion configuracion, CancellationToken ct);
}
