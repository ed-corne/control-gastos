using ControlGastos.Application.Metas;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetasController(MetaService servicio) : ControllerBase
{
    /// <summary>Metas activas, o el historial de metas cumplidas con <c>cumplidas=true</c>.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MetaDto>>> Listar(
        [FromQuery] bool cumplidas, CancellationToken ct) =>
        Ok(await servicio.ListarAsync(cumplidas, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MetaDto>> Obtener(Guid id, CancellationToken ct)
    {
        var meta = await servicio.ObtenerAsync(id, ct);
        return meta is null ? NotFound() : Ok(meta);
    }

    [HttpPost]
    public async Task<ActionResult<MetaDto>> Crear(GuardarMetaRequest request, CancellationToken ct)
    {
        var meta = await servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(Obtener), new { id = meta.Id }, meta);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MetaDto>> Editar(Guid id, GuardarMetaRequest request, CancellationToken ct)
    {
        var meta = await servicio.EditarAsync(id, request, ct);
        return meta is null ? NotFound() : Ok(meta);
    }

    [HttpGet("{id:guid}/operaciones")]
    public async Task<ActionResult<IReadOnlyList<OperacionMetaDto>>> Operaciones(Guid id, CancellationToken ct)
    {
        var operaciones = await servicio.ListarOperacionesAsync(id, ct);
        return operaciones is null ? NotFound() : Ok(operaciones);
    }

    [HttpPost("{id:guid}/operaciones")]
    public async Task<ActionResult<MetaDto>> RegistrarOperacion(
        Guid id, RegistrarOperacionMetaRequest request, CancellationToken ct)
    {
        var meta = await servicio.RegistrarOperacionAsync(id, request, ct);
        return meta is null ? NotFound() : Ok(meta);
    }
}
