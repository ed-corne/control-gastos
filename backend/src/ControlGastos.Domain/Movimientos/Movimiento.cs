namespace ControlGastos.Domain.Movimientos;

public enum TipoMovimiento
{
    Ingreso,
    Gasto,
    Transferencia
}

public class Movimiento
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public TipoMovimiento Tipo { get; set; }
    public decimal Monto { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public Guid CuentaId { get; set; }

    /// <summary>Solo para transferencias: la cuenta que recibe el dinero.</summary>
    public Guid? CuentaDestinoId { get; set; }

    /// <summary>Para ingresos y gastos. Las transferencias no llevan categoría.</summary>
    public Guid? CategoriaId { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
