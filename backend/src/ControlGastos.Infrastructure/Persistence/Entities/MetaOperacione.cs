using System;
using System.Collections.Generic;

namespace ControlGastos.Infrastructure.Persistence.Entities;

public partial class MetaOperacione
{
    public Guid Id { get; set; }

    public Guid MetaId { get; set; }

    public string Tipo { get; set; } = null!;

    public decimal Monto { get; set; }

    public DateOnly Fecha { get; set; }

    public string? Nota { get; set; }

    public DateTime FechaCreacion { get; set; }

    public virtual Meta Meta { get; set; } = null!;
}
