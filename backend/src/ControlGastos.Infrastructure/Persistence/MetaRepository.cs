using ControlGastos.Application.Metas;
using ControlGastos.Domain.Metas;
using Microsoft.EntityFrameworkCore;
using MetaEntity = ControlGastos.Infrastructure.Persistence.Entities.Meta;
using OperacionEntity = ControlGastos.Infrastructure.Persistence.Entities.MetaOperacione;

namespace ControlGastos.Infrastructure.Persistence;

public class MetaRepository(AppDbContext db) : IMetaRepository
{
    public async Task<IReadOnlyList<Meta>> ListarAsync(bool cumplidas, CancellationToken ct)
    {
        var consulta = db.Metas.AsNoTracking()
            .Where(m => cumplidas ? m.FechaCumplida != null : m.FechaCumplida == null);

        var filas = cumplidas
            ? await consulta.OrderByDescending(m => m.FechaCumplida).ToListAsync(ct)
            : await consulta.OrderBy(m => m.FechaLimite == null).ThenBy(m => m.FechaLimite).ThenBy(m => m.Nombre).ToListAsync(ct);

        return filas.Select(ADominio).ToList();
    }

    public async Task<Meta?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var fila = await db.Metas.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id, ct);
        return fila is null ? null : ADominio(fila);
    }

    public async Task AgregarAsync(Meta meta, CancellationToken ct)
    {
        var fila = new MetaEntity { Id = meta.Id, FechaCreacion = meta.FechaCreacion };
        Copiar(meta, fila);
        db.Metas.Add(fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Meta meta, CancellationToken ct)
    {
        var fila = await db.Metas.FirstAsync(m => m.Id == meta.Id, ct);
        Copiar(meta, fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyDictionary<Guid, decimal>> AhorradoPorMetaAsync(CancellationToken ct) =>
        await db.MetaOperaciones.AsNoTracking()
            .GroupBy(o => o.MetaId)
            .Select(g => new { g.Key, Total = g.Sum(o => o.Tipo == "Aportacion" ? o.Monto : -o.Monto) })
            .ToDictionaryAsync(x => x.Key, x => x.Total, ct);

    public async Task<IReadOnlyList<OperacionMeta>> ListarOperacionesAsync(Guid metaId, CancellationToken ct)
    {
        var filas = await db.MetaOperaciones.AsNoTracking()
            .Where(o => o.MetaId == metaId)
            .OrderByDescending(o => o.Fecha).ThenByDescending(o => o.FechaCreacion)
            .ToListAsync(ct);

        return filas.Select(f => new OperacionMeta
        {
            Id = f.Id,
            MetaId = f.MetaId,
            Tipo = Enum.Parse<TipoOperacionMeta>(f.Tipo),
            Monto = f.Monto,
            Fecha = f.Fecha,
            Nota = f.Nota,
            FechaCreacion = f.FechaCreacion,
        }).ToList();
    }

    public async Task AgregarOperacionAsync(OperacionMeta operacion, CancellationToken ct)
    {
        db.MetaOperaciones.Add(new OperacionEntity
        {
            Id = operacion.Id,
            MetaId = operacion.MetaId,
            Tipo = operacion.Tipo.ToString(),
            Monto = operacion.Monto,
            Fecha = operacion.Fecha,
            Nota = operacion.Nota,
            FechaCreacion = operacion.FechaCreacion,
        });
        await db.SaveChangesAsync(ct);
    }

    private static void Copiar(Meta o, MetaEntity d)
    {
        d.Nombre = o.Nombre;
        d.MontoObjetivo = o.MontoObjetivo;
        d.FechaLimite = o.FechaLimite;
        d.Icono = o.Icono;
        d.Color = o.Color;
        d.FechaCumplida = o.FechaCumplida;
    }

    private static Meta ADominio(MetaEntity f) => new()
    {
        Id = f.Id,
        Nombre = f.Nombre,
        MontoObjetivo = f.MontoObjetivo,
        FechaLimite = f.FechaLimite,
        Icono = f.Icono,
        Color = f.Color,
        FechaCreacion = f.FechaCreacion,
        FechaCumplida = f.FechaCumplida,
    };
}
