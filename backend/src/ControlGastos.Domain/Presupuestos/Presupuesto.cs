namespace ControlGastos.Domain.Presupuestos;

public enum EstadoPresupuesto
{
    Verde,
    Amarillo,
    Rojo
}

public class Presupuesto
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Null = presupuesto global de todos los gastos del mes.</summary>
    public Guid? CategoriaId { get; set; }
    public int Anio { get; set; }
    public int Mes { get; set; }
    public decimal Monto { get; set; }

    /// <summary>
    /// RF-PRE-03: verde por debajo del 75 %, amarillo entre 75 % y 100 %, rojo por encima del 100 %.
    /// </summary>
    public static EstadoPresupuesto CalcularEstado(decimal porcentaje) =>
        porcentaje > 100 ? EstadoPresupuesto.Rojo
        : porcentaje >= 75 ? EstadoPresupuesto.Amarillo
        : EstadoPresupuesto.Verde;
}
