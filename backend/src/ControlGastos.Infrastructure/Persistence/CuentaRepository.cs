using ControlGastos.Application.Cuentas;
using ControlGastos.Domain.Cuentas;
using Microsoft.EntityFrameworkCore;
using CuentaEntity = ControlGastos.Infrastructure.Persistence.Entities.Cuenta;

namespace ControlGastos.Infrastructure.Persistence;

/// <summary>
/// Convierte entre el modelo generado desde la base (Database First) y la entidad de dominio.
/// </summary>
public class CuentaRepository(AppDbContext db) : ICuentaRepository
{
    public async Task<IReadOnlyList<Cuenta>> ListarAsync(bool incluirArchivadas, CancellationToken ct)
    {
        var filas = await db.Cuentas
            .AsNoTracking()
            .Where(c => incluirArchivadas || !c.Archivada)
            .OrderBy(c => c.Archivada).ThenBy(c => c.Nombre)
            .ToListAsync(ct);

        return filas.Select(ADominio).ToList();
    }

    public async Task<Cuenta?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var fila = await db.Cuentas.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);
        return fila is null ? null : ADominio(fila);
    }

    public async Task AgregarAsync(Cuenta cuenta, CancellationToken ct)
    {
        var fila = new CuentaEntity { Id = cuenta.Id, FechaCreacion = cuenta.FechaCreacion };
        Copiar(cuenta, fila);
        db.Cuentas.Add(fila);
        await db.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Cuenta cuenta, CancellationToken ct)
    {
        var fila = await db.Cuentas.FirstAsync(c => c.Id == cuenta.Id, ct);
        Copiar(cuenta, fila);
        await db.SaveChangesAsync(ct);
    }

    private static void Copiar(Cuenta origen, CuentaEntity destino)
    {
        destino.Nombre = origen.Nombre;
        destino.Tipo = origen.Tipo.ToString();
        destino.SaldoInicial = origen.SaldoInicial;
        destino.Color = origen.Color;
        destino.Icono = origen.Icono;
        destino.Archivada = origen.Archivada;
    }

    private static Cuenta ADominio(CuentaEntity f) => new()
    {
        Id = f.Id,
        Nombre = f.Nombre,
        Tipo = Enum.Parse<TipoCuenta>(f.Tipo),
        SaldoInicial = f.SaldoInicial,
        Color = f.Color,
        Icono = f.Icono,
        Archivada = f.Archivada,
        FechaCreacion = f.FechaCreacion,
    };
}
