using ControlGastos.Application.Presupuestos;
using ControlGastos.Domain.Presupuestos;
using Microsoft.EntityFrameworkCore;
using PresupuestoEntity = ControlGastos.Infrastructure.Persistence.Entities.Presupuesto;

namespace ControlGastos.Infrastructure.Persistence;

public class PresupuestoRepository(AppDbContext db) : IPresupuestoRepository
{
    public async Task<IReadOnlyList<Presupuesto>> ListarAsync(int anio, int mes, CancellationToken ct)
    {
        var filas = await db.Presupuestos.AsNoTracking()
            .Where(p => p.Anio == anio && p.Mes == mes)
            .ToListAsync(ct);
        return filas.Select(ADominio).ToList();
    }

    public async Task<Presupuesto?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var fila = await db.Presupuestos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);
        return fila is null ? null : ADominio(fila);
    }

    public Task<bool> ExisteAsync(int anio, int mes, Guid? categoriaId, CancellationToken ct) =>
        db.Presupuestos.AnyAsync(p => p.Anio == anio && p.Mes == mes && p.CategoriaId == categoriaId, ct);

    public async Task AgregarAsync(Presupuesto presupuesto, CancellationToken ct)
    {
        var fila = new PresupuestoEntity { Id = presupuesto.Id };
        Copiar(presupuesto, fila);
        db.Presupuestos.Add(fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Presupuesto presupuesto, CancellationToken ct)
    {
        var fila = await db.Presupuestos.FirstAsync(p => p.Id == presupuesto.Id, ct);
        Copiar(presupuesto, fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task<bool> EliminarAsync(Guid id, CancellationToken ct) =>
        await db.Presupuestos.Where(p => p.Id == id).ExecuteDeleteAsync(ct) > 0;

    private static void Copiar(Presupuesto o, PresupuestoEntity d)
    {
        d.CategoriaId = o.CategoriaId;
        d.Anio = o.Anio;
        d.Mes = o.Mes;
        d.Monto = o.Monto;
    }

    private static Presupuesto ADominio(PresupuestoEntity f) => new()
    {
        Id = f.Id,
        CategoriaId = f.CategoriaId,
        Anio = f.Anio,
        Mes = f.Mes,
        Monto = f.Monto,
    };
}
