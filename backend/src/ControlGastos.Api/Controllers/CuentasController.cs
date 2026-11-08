using ControlGastos.Application.Cuentas;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CuentasController(CuentaService servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CuentaDto>>> Listar(
        [FromQuery] bool incluirArchivadas, CancellationToken ct) =>
        Ok(await servicio.ListarAsync(incluirArchivadas, ct));

    [HttpGet("resumen")]
    public async Task<ActionResult<ResumenCuentasDto>> Resumen(CancellationToken ct) =>
        Ok(await servicio.ObtenerResumenAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CuentaDto>> Obtener(Guid id, CancellationToken ct)
    {
        var cuenta = await servicio.ObtenerAsync(id, ct);
        return cuenta is null ? NotFound() : Ok(cuenta);
    }

    [HttpPost]
    public async Task<ActionResult<CuentaDto>> Crear(GuardarCuentaRequest request, CancellationToken ct)
    {
        var cuenta = await servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(Obtener), new { id = cuenta.Id }, cuenta);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CuentaDto>> Editar(Guid id, GuardarCuentaRequest request, CancellationToken ct)
    {
        var cuenta = await servicio.EditarAsync(id, request, ct);
        return cuenta is null ? NotFound() : Ok(cuenta);
    }

    [HttpPatch("{id:guid}/archivar")]
    public async Task<ActionResult<CuentaDto>> Archivar(Guid id, CancellationToken ct)
    {
        var cuenta = await servicio.CambiarArchivadaAsync(id, true, ct);
        return cuenta is null ? NotFound() : Ok(cuenta);
    }

    [HttpPatch("{id:guid}/restaurar")]
    public async Task<ActionResult<CuentaDto>> Restaurar(Guid id, CancellationToken ct)
    {
        var cuenta = await servicio.CambiarArchivadaAsync(id, false, ct);
        return cuenta is null ? NotFound() : Ok(cuenta);
    }
}
