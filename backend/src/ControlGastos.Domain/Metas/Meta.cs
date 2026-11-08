namespace ControlGastos.Domain.Metas;

public enum TipoOperacionMeta
{
    Aportacion,
    Retiro
}

public class Meta
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public decimal MontoObjetivo { get; set; }
    public DateOnly? FechaLimite { get; set; }
    public string Icono { get; set; } = "target";
    public string Color { get; set; } = "#4f46e5";
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>Se llena cuando el ahorro alcanza el objetivo (RF-MET-06).</summary>
    public DateTime? FechaCumplida { get; set; }

    public bool Cumplida => FechaCumplida is not null;
}

public class OperacionMeta
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MetaId { get; set; }
    public TipoOperacionMeta Tipo { get; set; }
    public decimal Monto { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Nota { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
