using ControlGastos.Application.Categorias;
using ControlGastos.Domain.Categorias;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController(CategoriaService servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoriaDto>>> Listar(
        [FromQuery] TipoCategoria? tipo, [FromQuery] bool incluirArchivadas, CancellationToken ct) =>
        Ok(await servicio.ListarAsync(tipo, incluirArchivadas, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoriaDto>> Obtener(Guid id, CancellationToken ct)
    {
        var categoria = await servicio.ObtenerAsync(id, ct);
        return categoria is null ? NotFound() : Ok(categoria);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> Crear(GuardarCategoriaRequest request, CancellationToken ct)
    {
        var categoria = await servicio.CrearAsync(request, ct);
        return CreatedAtAction(nameof(Obtener), new { id = categoria.Id }, categoria);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoriaDto>> Editar(Guid id, GuardarCategoriaRequest request, CancellationToken ct)
    {
        var categoria = await servicio.EditarAsync(id, request, ct);
        return categoria is null ? NotFound() : Ok(categoria);
    }

    [HttpPatch("{id:guid}/archivar")]
    public async Task<ActionResult<CategoriaDto>> Archivar(Guid id, CancellationToken ct)
    {
        var categoria = await servicio.CambiarArchivadaAsync(id, true, ct);
        return categoria is null ? NotFound() : Ok(categoria);
    }

    [HttpPatch("{id:guid}/restaurar")]
    public async Task<ActionResult<CategoriaDto>> Restaurar(Guid id, CancellationToken ct)
    {
        var categoria = await servicio.CambiarArchivadaAsync(id, false, ct);
        return categoria is null ? NotFound() : Ok(categoria);
    }
}
