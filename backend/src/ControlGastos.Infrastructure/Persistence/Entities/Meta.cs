using System;
using System.Collections.Generic;

namespace ControlGastos.Infrastructure.Persistence.Entities;

public partial class Meta
{
    public Guid Id { get; set; }

    public string Nombre { get; set; } = null!;

    public decimal MontoObjetivo { get; set; }

    public DateOnly? FechaLimite { get; set; }

    public string Icono { get; set; } = null!;

    public string Color { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public DateTime? FechaCumplida { get; set; }

    public virtual ICollection<MetaOperacione> MetaOperaciones { get; set; } = new List<MetaOperacione>();
}
