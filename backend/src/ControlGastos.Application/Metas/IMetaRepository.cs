using ControlGastos.Domain.Metas;

namespace ControlGastos.Application.Metas;

public interface IMetaRepository
{
    Task<IReadOnlyList<Meta>> ListarAsync(bool cumplidas, CancellationToken ct);
    Task<Meta?> ObtenerAsync(Guid id, CancellationToken ct);
    Task AgregarAsync(Meta meta, CancellationToken ct);
    Task ActualizarAsync(Meta meta, CancellationToken ct);

    /// <summary>Aportaciones menos retiros de cada meta.</summary>
    Task<IReadOnlyDictionary<Guid, decimal>> AhorradoPorMetaAsync(CancellationToken ct);

    Task<IReadOnlyList<OperacionMeta>> ListarOperacionesAsync(Guid metaId, CancellationToken ct);
    Task AgregarOperacionAsync(OperacionMeta operacion, CancellationToken ct);
}
