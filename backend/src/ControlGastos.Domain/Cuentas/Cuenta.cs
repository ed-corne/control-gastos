namespace ControlGastos.Domain.Cuentas;

public class Cuenta
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public TipoCuenta Tipo { get; set; }

    /// <summary>
    /// Saldo con el que arranca la cuenta. En tarjetas de crédito representa lo que se debe.
    /// </summary>
    public decimal SaldoInicial { get; set; }
    public string Color { get; set; } = "#4f46e5";
    public string Icono { get; set; } = "wallet";
    public bool Archivada { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
