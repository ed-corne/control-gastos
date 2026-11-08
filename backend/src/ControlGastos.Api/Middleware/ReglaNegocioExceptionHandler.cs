using ControlGastos.Application.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Middleware;

/// <summary>Convierte las violaciones de reglas de negocio en respuestas 409.</summary>
public class ReglaNegocioExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        if (exception is not ReglaNegocioException)
            return false;

        context.Response.StatusCode = StatusCodes.Status409Conflict;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "Regla de negocio",
            Detail = exception.Message
        }, ct);
        return true;
    }
}
