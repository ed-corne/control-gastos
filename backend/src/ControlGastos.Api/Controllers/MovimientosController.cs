using ControlGastos.Application.Common;
using ControlGastos.Application.Movimientos;
using ControlGastos.Domain.Movimientos;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovimientosController(MovimientoService servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ResultadoPaginado<MovimientoDto>>> Listar(
        [FromQuery] FiltroMovimientos filtro, CancellationToken ct) =>
        Ok(await servicio.ListarAsync(filtro, ct));

    [HttpGet("sugerencias")]
    public async Task<ActionResult<SugerenciasMovimientoDto>> Sugerencias(CancellationToken ct) =>
        Ok(await servicio.ObtenerSugerenciasAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MovimientoDto>> Obtener(Guid id, CancellationToken ct)
    {
        var movimiento = await servicio.ObtenerAsync(id, ct);
        return movimiento is null ? NotFound() : Ok(movimiento);
    }

    [HttpPost]
    public async Task<ActionResult<MovimientoDto>> Crear(GuardarMovimientoRequest request, CancellationToken ct)
    {
        var movimiento = await servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(Obtener), new { id = movimiento.Id }, movimiento);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MovimientoDto>> Editar(Guid id, GuardarMovimientoRequest request, CancellationToken ct)
    {
        var movimiento = await servicio.EditarAsync(id, request, ct);
        return movimiento is null ? NotFound() : Ok(movimiento);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct) =>
        await servicio.EliminarAsync(id, ct) ? NoContent() : NotFound();
}
