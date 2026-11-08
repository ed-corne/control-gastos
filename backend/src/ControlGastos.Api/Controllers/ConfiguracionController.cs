using ControlGastos.Application.Configuraciones;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfiguracionController(ConfiguracionService servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ConfiguracionDto>> Obtener(CancellationToken ct) =>
        Ok(await servicio.ObtenerAsync(ct));

    [HttpPut]
    public async Task<ActionResult<ConfiguracionDto>> Guardar(GuardarConfiguracionRequest request, CancellationToken ct) =>
        Ok(await servicio.GuardarAsync(request, ct));
}
