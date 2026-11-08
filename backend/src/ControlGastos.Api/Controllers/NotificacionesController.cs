using ControlGastos.Application.Notificaciones;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificacionesController(NotificacionService servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificacionDto>>> Listar(CancellationToken ct) =>
        Ok(await servicio.ListarAsync(ct));
}
