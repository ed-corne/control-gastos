using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        status = "ok",
        service = "ControlGastos.Api",
        timestamp = DateTime.UtcNow
    });
}
