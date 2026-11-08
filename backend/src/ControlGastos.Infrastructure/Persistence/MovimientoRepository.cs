using ControlGastos.Application.Movimientos;
using ControlGastos.Domain.Movimientos;
using Microsoft.EntityFrameworkCore;
using MovimientoEntity = ControlGastos.Infrastructure.Persistence.Entities.Movimiento;

namespace ControlGastos.Infrastructure.Persistence;

public class MovimientoRepository(AppDbContext db) : IMovimientoRepository
{
    public async Task<(IReadOnlyList<Movimiento> Items, int Total)> ListarAsync(
        FiltroMovimientos f, CancellationToken ct)
    {
        var consulta = db.Movimientos.AsNoTracking().AsQueryable();

        if (f.Desde is { } desde) consulta = consulta.Where(m => m.Fecha >= desde);
        if (f.Hasta is { } hasta) consulta = consulta.Where(m => m.Fecha <= hasta);
        if (f.Tipo is { } tipo)
        {
            var texto = tipo.ToString();
            consulta = consulta.Where(m => m.Tipo == texto);
        }
        if (f.CategoriaId is { } categoria) consulta = consulta.Where(m => m.CategoriaId == categoria);
        if (f.CuentaId is { } cuenta)
            consulta = consulta.Where(m => m.CuentaId == cuenta || m.CuentaDestinoId == cuenta);
        if (f.MontoMin is { } min) consulta = consulta.Where(m => m.Monto >= min);
        if (f.MontoMax is { } max) consulta = consulta.Where(m => m.Monto <= max);
        if (!string.IsNullOrWhiteSpace(f.Texto))
        {
            var patron = $"%{f.Texto.Trim()}%";
            consulta = consulta.Where(m => m.Descripcion != null && EF.Functions.ILike(m.Descripcion, patron));
        }

        var total = await consulta.CountAsync(ct);
        var filas = await consulta
            .OrderByDescending(m => m.Fecha).ThenByDescending(m => m.FechaCreacion)
            .Skip((f.Pagina - 1) * f.Tamano).Take(f.Tamano)
            .ToListAsync(ct);

        return (filas.Select(ADominio).ToList(), total);
    }

    public async Task<Movimiento?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var fila = await db.Movimientos.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id, ct);
        return fila is null ? null : ADominio(fila);
    }

    public async Task AgregarAsync(Movimiento movimiento, CancellationToken ct)
    {
        var fila = new MovimientoEntity { Id = movimiento.Id, FechaCreacion = movimiento.FechaCreacion };
        Copiar(movimiento, fila);
        db.Movimientos.Add(fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Movimiento movimiento, CancellationToken ct)
    {
        var fila = await db.Movimientos.FirstAsync(m => m.Id == movimiento.Id, ct);
        Copiar(movimiento, fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task<bool> EliminarAsync(Guid id, CancellationToken ct) =>
        await db.Movimientos.Where(m => m.Id == id).ExecuteDeleteAsync(ct) > 0;

    public async Task<IReadOnlyDictionary<Guid, decimal>> TotalesPorCategoriaAsync(
        TipoMovimiento tipo, DateOnly desde, DateOnly hasta, CancellationToken ct)
    {
        var texto = tipo.ToString();
        return await db.Movimientos.AsNoTracking()
            .Where(m => m.Tipo == texto && m.CategoriaId != null && m.Fecha >= desde && m.Fecha <= hasta)
            .GroupBy(m => m.CategoriaId!.Value)
            .Select(g => new { g.Key, Total = g.Sum(m => m.Monto) })
            .ToDictionaryAsync(x => x.Key, x => x.Total, ct);
    }

    public async Task<IReadOnlyDictionary<(int Anio, int Mes), decimal>> TotalesPorMesAsync(
        TipoMovimiento tipo, DateOnly desde, DateOnly hasta, Guid? categoriaId, CancellationToken ct)
    {
        var texto = tipo.ToString();
        var consulta = db.Movimientos.AsNoTracking()
            .Where(m => m.Tipo == texto && m.Fecha >= desde && m.Fecha <= hasta);

        if (categoriaId is { } id) consulta = consulta.Where(m => m.CategoriaId == id);

        var filas = await consulta
            .GroupBy(m => new { m.Fecha.Year, m.Fecha.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(m => m.Monto) })
            .ToListAsync(ct);

        return filas.ToDictionary(f => (f.Year, f.Month), f => f.Total);
    }

    public async Task AgregarVariosAsync(IReadOnlyList<Movimiento> lista, CancellationToken ct)
    {
        foreach (var m in lista)
        {
            var fila = new MovimientoEntity { Id = m.Id, FechaCreacion = m.FechaCreacion };
            Copiar(m, fila);
            db.Movimientos.Add(fila);
        }
        await db.SaveChangesAsync(ct);
    }

    public async Task<HashSet<(DateOnly Fecha, decimal Monto, Guid CuentaId)>> ObtenerClavesAsync(
        DateOnly desde, DateOnly hasta, CancellationToken ct)
    {
        var filas = await db.Movimientos.AsNoTracking()
            .Where(m => m.Tipo != "Transferencia" && m.Fecha >= desde && m.Fecha <= hasta)
            .Select(m => new { m.Fecha, m.Monto, m.CuentaId })
            .ToListAsync(ct);

        return filas.Select(f => (f.Fecha, f.Monto, f.CuentaId)).ToHashSet();
    }

    public Task<Guid?> UltimaCuentaUsadaAsync(CancellationToken ct) =>
        db.Movimientos.AsNoTracking()
            .OrderByDescending(m => m.FechaCreacion)
            .Select(m => (Guid?)m.CuentaId)
            .FirstOrDefaultAsync(ct);

    public async Task<IReadOnlyList<Guid>> CategoriasFrecuentesAsync(
        TipoMovimiento tipo, int cantidad, CancellationToken ct)
    {
        var texto = tipo.ToString();
        return await db.Movimientos.AsNoTracking()
            .Where(m => m.Tipo == texto && m.CategoriaId != null)
            .GroupBy(m => m.CategoriaId!.Value)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .Take(cantidad)
            .ToListAsync(ct);
    }

    private static void Copiar(Movimiento o, MovimientoEntity d)
    {
        d.Tipo = o.Tipo.ToString();
        d.Monto = o.Monto;
        d.Fecha = o.Fecha;
        d.Descripcion = o.Descripcion;
        d.CuentaId = o.CuentaId;
        d.CuentaDestinoId = o.CuentaDestinoId;
        d.CategoriaId = o.CategoriaId;
    }

    private static Movimiento ADominio(MovimientoEntity f) => new()
    {
        Id = f.Id,
        Tipo = Enum.Parse<TipoMovimiento>(f.Tipo),
        Monto = f.Monto,
        Fecha = f.Fecha,
        Descripcion = f.Descripcion,
        CuentaId = f.CuentaId,
        CuentaDestinoId = f.CuentaDestinoId,
        CategoriaId = f.CategoriaId,
        FechaCreacion = f.FechaCreacion,
    };
}
