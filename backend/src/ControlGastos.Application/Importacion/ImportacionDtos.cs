using System.ComponentModel.DataAnnotations;

namespace ControlGastos.Application.Importacion;

public sealed record FilaImportacion
{
    /// <summary>Número de fila en el archivo original, para reportar errores.</summary>
    public int Numero { get; init; }

    /// <summary>Fecha ya normalizada a yyyy-MM-dd.</summary>
    public string? Fecha { get; init; }

    public decimal? Monto { get; init; }

    /// <summary>"Gasto" o "Ingreso". Si falta, se deduce del signo del monto.</summary>
    public string? Tipo { get; init; }

    public string? Categoria { get; init; }
    public string? Cuenta { get; init; }

    [StringLength(500)]
    public string? Descripcion { get; init; }
}

public sealed record ImportarMovimientosRequest
{
    /// <summary>Cuenta que se usa cuando la fila no trae cuenta o su nombre no existe.</summary>
    public Guid? CuentaPredeterminadaId { get; init; }

    /// <summary>Sin columna de tipo: true = los montos positivos son gastos; false = son ingresos.</summary>
    public bool PositivosSonGastos { get; init; }

    /// <summary>true = solo revisa y reporta, sin guardar nada.</summary>
    public bool SoloValidar { get; init; }

    /// <summary>true = las filas duplicadas no se importan.</summary>
    public bool OmitirDuplicados { get; init; } = true;

    [Required, MaxLength(5000)]
    public List<FilaImportacion> Filas { get; init; } = [];
}

public enum EstadoFila
{
    Valida,
    Duplicada,
    Error
}

public sealed record ResultadoFilaDto(int Numero, EstadoFila Estado, string? Mensaje);

public sealed record ResultadoImportacionDto(
    int Total,
    int Validas,
    int Duplicadas,
    int ConError,
    int Importadas,
    IReadOnlyList<ResultadoFilaDto> Filas);
