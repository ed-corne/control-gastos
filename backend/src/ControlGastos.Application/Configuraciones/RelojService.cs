using ControlGastos.Domain.Configuraciones;

namespace ControlGastos.Application.Configuraciones;

/// <summary>
/// Fecha y hora "de hoy" según la zona horaria configurada, y periodos del mes financiero.
/// </summary>
public class RelojService(IConfiguracionRepository repositorio)
{
    public async Task<DateTime> AhoraAsync(CancellationToken ct)
    {
        var config = await repositorio.ObtenerAsync(ct);
        return TimeZoneInfo.ConvertTime(DateTime.UtcNow, ObtenerZona(config.ZonaHoraria));
    }

    public async Task<DateOnly> HoyAsync(CancellationToken ct) =>
        DateOnly.FromDateTime(await AhoraAsync(ct));

    public async Task<int> DiaInicioMesAsync(CancellationToken ct) =>
        (await repositorio.ObtenerAsync(ct)).DiaInicioMes;

    /// <summary>Periodo del mes financiero (año, mes) según el día de inicio configurado.</summary>
    public async Task<(DateOnly Desde, DateOnly Hasta)> RangoAsync(int anio, int mes, CancellationToken ct) =>
        Configuracion.Rango(anio, mes, await DiaInicioMesAsync(ct));

    public static bool ZonaValida(string id)
    {
        try
        {
            TimeZoneInfo.FindSystemTimeZoneById(id);
            return true;
        }
        catch (Exception e) when (e is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            return false;
        }
    }

    private static TimeZoneInfo ObtenerZona(string id) =>
        ZonaValida(id) ? TimeZoneInfo.FindSystemTimeZoneById(id) : TimeZoneInfo.Local;
}
