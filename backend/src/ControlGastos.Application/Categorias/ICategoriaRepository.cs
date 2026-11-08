using ControlGastos.Domain.Categorias;

namespace ControlGastos.Application.Categorias;

public interface ICategoriaRepository
{
    Task<IReadOnlyList<Categoria>> ListarAsync(TipoCategoria? tipo, bool incluirArchivadas, CancellationToken ct);
    Task<Categoria?> ObtenerAsync(Guid id, CancellationToken ct);
    Task<bool> ExisteNombreAsync(string nombre, TipoCategoria tipo, Guid? excluirId, CancellationToken ct);
    Task AgregarAsync(Categoria categoria, CancellationToken ct);
    Task ActualizarAsync(Categoria categoria, CancellationToken ct);
}
