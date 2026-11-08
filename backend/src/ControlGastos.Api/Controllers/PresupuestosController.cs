using ControlGastos.Application.Presupuestos;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PresupuestosController(PresupuestoService servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PresupuestoDto>>> Listar(
        [FromQuery] int anio, [FromQuery] int mes, CancellationToken ct) =>
        Ok(await servicio.ListarAsync(anio, mes, ct));

    [HttpPost]
    public async Task<ActionResult<PresupuestoDto>> Crear(GuardarPresupuestoRequest request, CancellationToken ct) =>
        StatusCode(StatusCodes.Status201Created, await servicio.CrearAsync(request, ct));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PresupuestoDto>> Actualizar(
        Guid id, ActualizarPresupuestoRequest request, CancellationToken ct)
    {
        var presupuesto = await servicio.ActualizarAsync(id, request, ct);
        return presupuesto is null ? NotFound() : Ok(presupuesto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct) =>
        await servicio.EliminarAsync(id, ct) ? NoContent() : NotFound();

    /// <summary>Copia los presupuestos del mes anterior al mes indicado (RF-PRE-05).</summary>
    [HttpPost("copiar-mes-anterior")]
    public async Task<ActionResult<object>> CopiarMesAnterior(
        [FromQuery] int anio, [FromQuery] int mes, CancellationToken ct) =>
        Ok(new { copiados = await servicio.CopiarMesAnteriorAsync(anio, mes, ct) });
}
