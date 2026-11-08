using System;
using System.Collections.Generic;

namespace ControlGastos.Infrastructure.Persistence.Entities;

public partial class Movimiento
{
    public Guid Id { get; set; }

    public string Tipo { get; set; } = null!;

    public decimal Monto { get; set; }

    public DateOnly Fecha { get; set; }

    public string? Descripcion { get; set; }

    public Guid CuentaId { get; set; }

    public Guid? CuentaDestinoId { get; set; }

    public Guid? CategoriaId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public virtual Categoria? Categoria { get; set; }

    public virtual Cuenta Cuenta { get; set; } = null!;

    public virtual Cuenta? CuentaDestino { get; set; }
}
