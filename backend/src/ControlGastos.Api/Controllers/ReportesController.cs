using ControlGastos.Application.Reportes;
using Microsoft.AspNetCore.Mvc;

namespace ControlGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportesController(ReporteService servicio) : ControllerBase
{
    [HttpGet("ingresos-gastos")]
    public async Task<ActionResult<IReadOnlyList<IngresosGastosMesDto>>> IngresosGastos(
        [FromQuery] int meses = 12, CancellationToken ct = default) =>
        Ok(await servicio.IngresosContraGastosAsync(meses, ct));

    [HttpGet("categoria/{categoriaId:guid}")]
    public async Task<ActionResult<SerieCategoriaDto>> SerieCategoria(
        Guid categoriaId, [FromQuery] int meses = 12, CancellationToken ct = default)
    {
        var serie = await servicio.SerieDeCategoriaAsync(categoriaId, meses, ct);
        return serie is null ? NotFound() : Ok(serie);
    }

    [HttpGet("ranking-categorias")]
    public async Task<ActionResult<IReadOnlyList<RankingMesDto>>> RankingCategorias(
        [FromQuery] int meses = 12, CancellationToken ct = default) =>
        Ok(await servicio.RankingCategoriasAsync(meses, ct));

    [HttpGet("comparativo")]
    public async Task<ActionResult<ComparativoMensualDto>> Comparativo(
        [FromQuery] int anio, [FromQuery] int mes, CancellationToken ct) =>
        Ok(await servicio.CompararMesesAsync(anio, mes, ct));
}
