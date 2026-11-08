namespace ControlGastos.Domain.Configuraciones;

public class Configuracion
{
    public string Nombre { get; set; } = string.Empty;
    public string Moneda { get; set; } = "MXN";
    public string ZonaHoraria { get; set; } = "America/Mexico_City";

    /// <summary>Día en que empieza el mes financiero (1–28), por ejemplo el día de pago.</summary>
    public int DiaInicioMes { get; set; } = 1;

    public bool RecordatorioActivo { get; set; }
    public TimeOnly RecordatorioHora { get; set; } = new(20, 0);

    /// <summary>
    /// Periodo del mes financiero (año, mes): empieza el día <paramref name="diaInicio"/> de ese mes
    /// y termina el día anterior del mes siguiente. Con día 1 es el mes calendario.
    /// </summary>
    public static (DateOnly Desde, DateOnly Hasta) Rango(int anio, int mes, int diaInicio)
    {
        var desde = new DateOnly(anio, mes, diaInicio);
        return (desde, desde.AddMonths(1).AddDays(-1));
    }

    /// <summary>Mes financiero (año, mes) al que pertenece una fecha.</summary>
    public static (int Anio, int Mes) MesFinancieroDe(DateOnly fecha, int diaInicio)
    {
        if (fecha.Day >= diaInicio) return (fecha.Year, fecha.Month);
        var anterior = fecha.AddMonths(-1);
        return (anterior.Year, anterior.Month);
    }
}
