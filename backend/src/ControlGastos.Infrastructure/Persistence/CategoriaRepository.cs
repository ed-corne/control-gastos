using ControlGastos.Application.Categorias;
using ControlGastos.Domain.Categorias;
using Microsoft.EntityFrameworkCore;
using CategoriaEntity = ControlGastos.Infrastructure.Persistence.Entities.Categoria;

namespace ControlGastos.Infrastructure.Persistence;

public class CategoriaRepository(AppDbContext db) : ICategoriaRepository
{
    public async Task<IReadOnlyList<Categoria>> ListarAsync(
        TipoCategoria? tipo, bool incluirArchivadas, CancellationToken ct)
    {
        var consulta = db.Categorias.AsNoTracking().Where(c => incluirArchivadas || !c.Archivada);

        if (tipo is not null)
        {
            var texto = tipo.Value.ToString();
            consulta = consulta.Where(c => c.Tipo == texto);
        }

        var filas = await consulta
            .OrderBy(c => c.Archivada).ThenBy(c => c.Tipo).ThenBy(c => c.Nombre)
            .ToListAsync(ct);

        return filas.Select(ADominio).ToList();
    }

    public async Task<Categoria?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var fila = await db.Categorias.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);
        return fila is null ? null : ADominio(fila);
    }

    public Task<bool> ExisteNombreAsync(string nombre, TipoCategoria tipo, Guid? excluirId, CancellationToken ct)
    {
        var texto = tipo.ToString();
        var minuscula = nombre.ToLower();
        return db.Categorias.AnyAsync(
            c => c.Tipo == texto && c.Nombre.ToLower() == minuscula && c.Id != excluirId, ct);
    }

    public async Task AgregarAsync(Categoria categoria, CancellationToken ct)
    {
        var fila = new CategoriaEntity { Id = categoria.Id, FechaCreacion = categoria.FechaCreacion };
        Copiar(categoria, fila);
        db.Categorias.Add(fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Categoria categoria, CancellationToken ct)
    {
        var fila = await db.Categorias.FirstAsync(c => c.Id == categoria.Id, ct);
        Copiar(categoria, fila);
        await db.SaveChangesAsync(ct);
    }

    private static void Copiar(Categoria origen, CategoriaEntity destino)
    {
        destino.Nombre = origen.Nombre;
        destino.Tipo = origen.Tipo.ToString();
        destino.Color = origen.Color;
        destino.Icono = origen.Icono;
        destino.Comentario = origen.Comentario;
        destino.Archivada = origen.Archivada;
    }

    private static Categoria ADominio(CategoriaEntity f) => new()
    {
        Id = f.Id,
        Nombre = f.Nombre,
        Tipo = Enum.Parse<TipoCategoria>(f.Tipo),
        Color = f.Color,
        Icono = f.Icono,
        Comentario = f.Comentario,
        Archivada = f.Archivada,
        FechaCreacion = f.FechaCreacion,
    };
}
