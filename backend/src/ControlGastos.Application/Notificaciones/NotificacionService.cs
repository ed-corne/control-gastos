using ControlGastos.Application.Configuraciones;
using ControlGastos.Application.Movimientos;
using ControlGastos.Application.Presupuestos;
using ControlGastos.Domain.Configuraciones;
using ControlGastos.Domain.Presupuestos;

namespace ControlGastos.Application.Notificaciones;

public enum TipoNotificacion
{
    PresupuestoAlerta,
    PresupuestoExcedido,
    Recordatorio
}

public sealed record NotificacionDto(
    string Id,
    TipoNotificacion Tipo,
    string Mensaje,
    /// <summary>Ruta de la pantalla relacionada en el frontend.</summary>
    string Enlace);

/// <summary>
/// Avisos dentro de la app. Se calculan al consultarlos a partir del estado actual,
/// por lo que desaparecen solos cuando la situación se corrige.
/// </summary>
public class NotificacionService(
    PresupuestoService presupuestos,
    IMovimientoRepository movimientos,
    IConfiguracionRepository configuracion,
    RelojService reloj)
{
    public async Task<IReadOnlyList<NotificacionDto>> ListarAsync(CancellationToken ct)
    {
        var avisos = new List<NotificacionDto>();
        var config = await configuracion.ObtenerAsync(ct);
        var ahora = await reloj.AhoraAsync(ct);
        var hoy = DateOnly.FromDateTime(ahora);

        // RF-NOT-01: presupuestos del mes financiero actual al 75 % o rebasados.
        var (anio, mes) = Configuracion.MesFinancieroDe(hoy, config.DiaInicioMes);
        foreach (var p in await presupuestos.ListarAsync(anio, mes, ct))
        {
            if (p.Estado == EstadoPresupuesto.Rojo)
                avisos.Add(new NotificacionDto(
                    $"presupuesto-excedido:{p.Id}", TipoNotificacion.PresupuestoExcedido,
                    $"Rebasaste tu presupuesto de {p.CategoriaNombre}: llevas {p.Porcentaje}%.", "/presupuestos"));
            else if (p.Estado == EstadoPresupuesto.Amarillo)
                avisos.Add(new NotificacionDto(
                    $"presupuesto-alerta:{p.Id}", TipoNotificacion.PresupuestoAlerta,
                    $"Tu presupuesto de {p.CategoriaNombre} va al {p.Porcentaje}%.", "/presupuestos"));
        }

        // RF-NOT-03: recordatorio diario, solo si ya pasó la hora y hoy no hay movimientos.
        if (config.RecordatorioActivo && TimeOnly.FromDateTime(ahora) >= config.RecordatorioHora)
        {
            var (_, totalHoy) = await movimientos.ListarAsync(
                new FiltroMovimientos { Desde = hoy, Hasta = hoy, Pagina = 1, Tamano = 1 }, ct);

            if (totalHoy == 0)
                avisos.Add(new NotificacionDto(
                    $"recordatorio:{hoy:yyyy-MM-dd}", TipoNotificacion.Recordatorio,
                    "Todavía no registras gastos hoy. ¿Qué compraste?", "/movimientos"));
        }

        // Lo más urgente primero: presupuestos rebasados, luego alertas, luego el recordatorio.
        return avisos.OrderBy(a => a.Tipo switch
        {
            TipoNotificacion.PresupuestoExcedido => 0,
            TipoNotificacion.PresupuestoAlerta => 1,
            _ => 2,
        }).ToList();
    }
}
