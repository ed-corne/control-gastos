using ControlGastos.Application.Cuentas;
using ControlGastos.Domain.Cuentas;
using Microsoft.EntityFrameworkCore;

namespace ControlGastos.Infrastructure.Persistence;

public class CuentaRepository(AppDbContext db) : ICuentaRepository
{
    public async Task<IReadOnlyList<Cuenta>> ListarAsync(bool incluirArchivadas, CancellationToken ct) =>
        await db.Cuentas
            .Where(c => incluirArchivadas || !c.Archivada)
            .OrderBy(c => c.Archivada).ThenBy(c => c.Nombre)
            .ToListAsync(ct);

    public Task<Cuenta?> ObtenerAsync(Guid id, CancellationToken ct) =>
        db.Cuentas.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task AgregarAsync(Cuenta cuenta, CancellationToken ct) =>
        await db.Cuentas.AddAsync(cuenta, ct);

    public Task GuardarCambiosAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
