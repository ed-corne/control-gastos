using ControlGastos.Application.Common;
using ControlGastos.Domain.Configuraciones;

namespace ControlGastos.Application.Configuraciones;

public class ConfiguracionService(IConfiguracionRepository repositorio)
{
    public async Task<ConfiguracionDto> ObtenerAsync(CancellationToken ct) =>
        ToDto(await repositorio.ObtenerAsync(ct));

    public async Task<ConfiguracionDto> GuardarAsync(GuardarConfiguracionRequest r, CancellationToken ct)
    {
        if (!RelojService.ZonaValida(r.ZonaHoraria))
            throw new ReglaNegocioException("La zona horaria no es válida.");

        var configuracion = new Configuracion
        {
            Nombre = r.Nombre.Trim(),
            Moneda = r.Moneda.ToUpperInvariant(),
            ZonaHoraria = r.ZonaHoraria,
            DiaInicioMes = r.DiaInicioMes,
            RecordatorioActivo = r.RecordatorioActivo,
            RecordatorioHora = TimeOnly.ParseExact(r.RecordatorioHora, "HH:mm"),
        };

        await repositorio.GuardarAsync(configuracion, ct);
        return ToDto(configuracion);
    }

    private static ConfiguracionDto ToDto(Configuracion c) =>
        new(c.Nombre, c.Moneda, c.ZonaHoraria, c.DiaInicioMes, c.RecordatorioActivo, c.RecordatorioHora.ToString("HH:mm"));
}
