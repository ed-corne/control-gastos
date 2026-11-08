using System;
using System.Collections.Generic;

namespace ControlGastos.Infrastructure.Persistence.Entities;

public partial class Presupuesto
{
    public Guid Id { get; set; }

    public Guid? CategoriaId { get; set; }

    public int Anio { get; set; }

    public int Mes { get; set; }

    public decimal Monto { get; set; }

    public DateTime FechaCreacion { get; set; }

    public virtual Categoria? Categoria { get; set; }
}
