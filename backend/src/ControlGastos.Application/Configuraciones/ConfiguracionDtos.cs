using System.ComponentModel.DataAnnotations;

namespace ControlGastos.Application.Configuraciones;

public sealed record GuardarConfiguracionRequest
{
    [StringLength(100)]
    public string Nombre { get; init; } = string.Empty;

    [Required, RegularExpression("^[A-Za-z]{3}$", ErrorMessage = "La moneda debe ser un código de 3 letras, por ejemplo MXN.")]
    public string Moneda { get; init; } = "MXN";

    [Required, StringLength(60)]
    public string ZonaHoraria { get; init; } = "America/Mexico_City";

    [Range(1, 28, ErrorMessage = "El día de inicio del mes debe estar entre 1 y 28.")]
    public int DiaInicioMes { get; init; } = 1;

    public bool RecordatorioActivo { get; init; }

    /// <summary>Formato HH:mm.</summary>
    [Required, RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "La hora debe tener formato HH:mm.")]
    public string RecordatorioHora { get; init; } = "20:00";
}

public sealed record ConfiguracionDto(
    string Nombre,
    string Moneda,
    string ZonaHoraria,
    int DiaInicioMes,
    bool RecordatorioActivo,
    string RecordatorioHora);
