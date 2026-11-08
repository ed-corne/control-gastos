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

    /// <summary>Descarga los movimientos filtrados en CSV (se abre directo en Excel).</summary>
    [HttpGet("exportar")]
    public async Task<IActionResult> Exportar([FromQuery] FiltroMovimientos filtro, CancellationToken ct)
    {
        var csv = await servicio.ExportarCsvAsync(filtro, ct);
        // BOM UTF-8 para que Excel respete los acentos.
        var bytes = System.Text.Encoding.UTF8.GetPreamble().Concat(System.Text.Encoding.UTF8.GetBytes(csv)).ToArray();
        return File(bytes, "text/csv; charset=utf-8", $"movimientos-{DateTime.Now:yyyyMMdd}.csv");
    }

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
