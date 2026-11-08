using System;
using System.Collections.Generic;

namespace ControlGastos.Infrastructure.Persistence.Entities;

public partial class Categoria
{
    public Guid Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public string Color { get; set; } = null!;

    public string Icono { get; set; } = null!;

    public bool Archivada { get; set; }

    public DateTime FechaCreacion { get; set; }

    public virtual ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}
