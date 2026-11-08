using ControlGastos.Application.Common;
using ControlGastos.Domain.Categorias;

namespace ControlGastos.Application.Categorias;

public class CategoriaService(ICategoriaRepository repositorio)
{
    public async Task<IReadOnlyList<CategoriaDto>> ListarAsync(
        TipoCategoria? tipo, bool incluirArchivadas, CancellationToken ct)
    {
        var categorias = await repositorio.ListarAsync(tipo, incluirArchivadas, ct);
        return categorias.Select(ToDto).ToList();
    }

    public async Task<CategoriaDto?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var categoria = await repositorio.ObtenerAsync(id, ct);
        return categoria is null ? null : ToDto(categoria);
    }

    public async Task<CategoriaDto> CrearAsync(GuardarCategoriaRequest request, CancellationToken ct)
    {
        await ValidarNombreUnicoAsync(request, excluirId: null, ct);

        var categoria = new Categoria();
        Aplicar(categoria, request);
        await repositorio.AgregarAsync(categoria, ct);
        return ToDto(categoria);
    }

    public async Task<CategoriaDto?> EditarAsync(Guid id, GuardarCategoriaRequest request, CancellationToken ct)
    {
        var categoria = await repositorio.ObtenerAsync(id, ct);
        if (categoria is null) return null;

        await ValidarNombreUnicoAsync(request, excluirId: id, ct);

        Aplicar(categoria, request);
        await repositorio.ActualizarAsync(categoria, ct);
        return ToDto(categoria);
    }

    /// <summary>RF-CAT-02: archivar oculta la categoría sin perder los movimientos que la usan.</summary>
    public async Task<CategoriaDto?> CambiarArchivadaAsync(Guid id, bool archivada, CancellationToken ct)
    {
        var categoria = await repositorio.ObtenerAsync(id, ct);
        if (categoria is null) return null;

        if (!archivada && await repositorio.ExisteNombreAsync(categoria.Nombre, categoria.Tipo, id, ct))
            throw new ReglaNegocioException("Ya existe una categoría con ese nombre y tipo.");

        categoria.Archivada = archivada;
        await repositorio.ActualizarAsync(categoria, ct);
        return ToDto(categoria);
    }

    private async Task ValidarNombreUnicoAsync(GuardarCategoriaRequest r, Guid? excluirId, CancellationToken ct)
    {
        if (await repositorio.ExisteNombreAsync(r.Nombre.Trim(), r.Tipo, excluirId, ct))
            throw new ReglaNegocioException($"Ya existe una categoría de {r.Tipo.ToString().ToLower()} llamada “{r.Nombre.Trim()}”.");
    }

    private static void Aplicar(Categoria categoria, GuardarCategoriaRequest r)
    {
        categoria.Nombre = r.Nombre.Trim();
        categoria.Tipo = r.Tipo;
        categoria.Color = r.Color;
        categoria.Icono = r.Icono.Trim();
        categoria.Comentario = string.IsNullOrWhiteSpace(r.Comentario) ? null : r.Comentario.Trim();
    }

    private static CategoriaDto ToDto(Categoria c) =>
        new(c.Id, c.Nombre, c.Tipo, c.Color, c.Icono, c.Comentario, c.Archivada);
}
