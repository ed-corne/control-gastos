using ControlGastos.Application.Importacion;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportacionController(ImportacionService servicio) : ControllerBase
{
    /// <summary>
    /// Importa movimientos. Con <c>soloValidar=true</c> devuelve el análisis de cada fila sin guardar nada.
    /// </summary>
    [HttpPost("movimientos")]
    public async Task<ActionResult<ResultadoImportacionDto>> Movimientos(
        ImportarMovimientosRequest request, CancellationToken ct) =>
        Ok(await servicio.ImportarAsync(request, ct));
}
