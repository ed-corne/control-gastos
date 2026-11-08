using ControlGastos.Application.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(DashboardService servicio) : ControllerBase
{
    /// <summary>Resumen del periodo. Sin parámetros devuelve el mes financiero actual; con mesAnterior=true, el anterior.</summary>
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Obtener(
        [FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta,
        [FromQuery] bool mesAnterior, CancellationToken ct) =>
        Ok(await servicio.ObtenerAsync(desde, hasta, mesAnterior, ct));
}
