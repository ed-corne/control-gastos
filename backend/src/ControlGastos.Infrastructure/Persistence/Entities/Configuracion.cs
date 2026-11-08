using System;
using System.Collections.Generic;

namespace ControlGastos.Infrastructure.Persistence.Entities;

public partial class Configuracion
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Moneda { get; set; } = null!;

    public string ZonaHoraria { get; set; } = null!;

    public int DiaInicioMes { get; set; }

    public bool RecordatorioActivo { get; set; }

    public TimeOnly RecordatorioHora { get; set; }
}
