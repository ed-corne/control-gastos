using ControlGastos.Application.Configuraciones;
using ControlGastos.Domain.Configuraciones;
using Microsoft.EntityFrameworkCore;
using ConfiguracionEntity = ControlGastos.Infrastructure.Persistence.Entities.Configuracion;

namespace ControlGastos.Infrastructure.Persistence;

public class ConfiguracionRepository(AppDbContext db) : IConfiguracionRepository
{
    private const int IdUnico = 1;

    public async Task<Configuracion> ObtenerAsync(CancellationToken ct)
    {
        var fila = await db.Configuracions.AsNoTracking().FirstOrDefaultAsync(c => c.Id == IdUnico, ct);
        return fila is null ? new Configuracion() : ADominio(fila);
    }

    public async Task GuardarAsync(Configuracion configuracion, CancellationToken ct)
    {
        var fila = await db.Configuracions.FirstOrDefaultAsync(c => c.Id == IdUnico, ct);
        if (fila is null)
        {
            fila = new ConfiguracionEntity { Id = IdUnico };
            db.Configuracions.Add(fila);
        }

        fila.Nombre = configuracion.Nombre;
        fila.Moneda = configuracion.Moneda;
        fila.ZonaHoraria = configuracion.ZonaHoraria;
        fila.DiaInicioMes = configuracion.DiaInicioMes;
        fila.RecordatorioActivo = configuracion.RecordatorioActivo;
        fila.RecordatorioHora = configuracion.RecordatorioHora;
        await db.SaveChangesAsync(ct);
    }

    private static Configuracion ADominio(ConfiguracionEntity f) => new()
    {
        Nombre = f.Nombre,
        Moneda = f.Moneda,
        ZonaHoraria = f.ZonaHoraria,
        DiaInicioMes = f.DiaInicioMes,
        RecordatorioActivo = f.RecordatorioActivo,
        RecordatorioHora = f.RecordatorioHora,
    };
}
