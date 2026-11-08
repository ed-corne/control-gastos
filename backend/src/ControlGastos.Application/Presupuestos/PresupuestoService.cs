using ControlGastos.Application.Categorias;
using ControlGastos.Application.Common;
using ControlGastos.Application.Configuraciones;
using ControlGastos.Application.Movimientos;
using ControlGastos.Domain.Categorias;
using ControlGastos.Domain.Movimientos;
using ControlGastos.Domain.Presupuestos;

namespace ControlGastos.Application.Presupuestos;

public class PresupuestoService(
    IPresupuestoRepository presupuestos,
    IMovimientoRepository movimientos,
    ICategoriaRepository categorias,
    RelojService reloj)
{
    /// <summary>RF-PRE-02: asignado, gastado, restante y porcentaje, calculados con los movimientos del mes.</summary>
    public async Task<IReadOnlyList<PresupuestoDto>> ListarAsync(int anio, int mes, CancellationToken ct)
    {
        ValidarPeriodo(anio, mes);

        var lista = await presupuestos.ListarAsync(anio, mes, ct);
        if (lista.Count == 0) return [];

        // RF-PRE-04: el periodo empieza el día de inicio del mes financiero configurado.
        var (desde, hasta) = await reloj.RangoAsync(anio, mes, ct);
        var gastosPorCategoria = await movimientos.TotalesPorCategoriaAsync(TipoMovimiento.Gasto, desde, hasta, ct);
        var totalGastos = gastosPorCategoria.Values.Sum();
        var porCategoria = (await categorias.ListarAsync(null, true, ct)).ToDictionary(c => c.Id);

        return lista
            .Select(p => ToDto(p, porCategoria, gastosPorCategoria, totalGastos))
            .OrderBy(d => d.CategoriaId is not null) // el global primero
            .ThenBy(d => d.CategoriaNombre)
            .ToList();
    }

    /// <summary>RF-PRE-01: monto mensual para una categoría de gasto, o global para todo el mes.</summary>
    public async Task<PresupuestoDto> CrearAsync(GuardarPresupuestoRequest request, CancellationToken ct)
    {
        if (request.CategoriaId is { } categoriaId)
        {
            var categoria = await categorias.ObtenerAsync(categoriaId, ct)
                ?? throw new ReglaNegocioException("La categoría no existe.");
            if (categoria.Tipo != TipoCategoria.Gasto)
                throw new ReglaNegocioException("Solo se puede presupuestar categorías de gasto.");
            if (categoria.Archivada)
                throw new ReglaNegocioException($"La categoría “{categoria.Nombre}” está archivada.");
        }

        if (await presupuestos.ExisteAsync(request.Anio, request.Mes, request.CategoriaId, ct))
            throw new ReglaNegocioException("Ya existe un presupuesto para esa categoría en ese mes.");

        var presupuesto = new Presupuesto
        {
            CategoriaId = request.CategoriaId,
            Anio = request.Anio,
            Mes = request.Mes,
            Monto = request.Monto,
        };
        await presupuestos.AgregarAsync(presupuesto, ct);
        return await ADtoAsync(presupuesto, ct);
    }

    public async Task<PresupuestoDto?> ActualizarAsync(Guid id, ActualizarPresupuestoRequest request, CancellationToken ct)
    {
        var presupuesto = await presupuestos.ObtenerAsync(id, ct);
        if (presupuesto is null) return null;

        presupuesto.Monto = request.Monto;
        await presupuestos.ActualizarAsync(presupuesto, ct);
        return await ADtoAsync(presupuesto, ct);
    }

    public Task<bool> EliminarAsync(Guid id, CancellationToken ct) => presupuestos.EliminarAsync(id, ct);

    /// <summary>
    /// RF-PRE-05: copia los presupuestos del mes anterior al mes indicado.
    /// Los que ya existen en el mes destino no se tocan. Devuelve cuántos se crearon.
    /// </summary>
    public async Task<int> CopiarMesAnteriorAsync(int anio, int mes, CancellationToken ct)
    {
        ValidarPeriodo(anio, mes);

        var anterior = new DateOnly(anio, mes, 1).AddMonths(-1); // mes calendario previo (solo año y mes)
        var origen = await presupuestos.ListarAsync(anterior.Year, anterior.Month, ct);
        if (origen.Count == 0)
            throw new ReglaNegocioException("El mes anterior no tiene presupuestos que copiar.");

        var copiados = 0;
        foreach (var p in origen)
        {
            if (await presupuestos.ExisteAsync(anio, mes, p.CategoriaId, ct)) continue;

            await presupuestos.AgregarAsync(
                new Presupuesto { CategoriaId = p.CategoriaId, Anio = anio, Mes = mes, Monto = p.Monto }, ct);
            copiados++;
        }
        return copiados;
    }

    private async Task<PresupuestoDto> ADtoAsync(Presupuesto p, CancellationToken ct)
    {
        var (desde, hasta) = await reloj.RangoAsync(p.Anio, p.Mes, ct);
        var gastos = await movimientos.TotalesPorCategoriaAsync(TipoMovimiento.Gasto, desde, hasta, ct);
        var porCategoria = (await categorias.ListarAsync(null, true, ct)).ToDictionary(c => c.Id);
        return ToDto(p, porCategoria, gastos, gastos.Values.Sum());
    }

    private static PresupuestoDto ToDto(
        Presupuesto p,
        IReadOnlyDictionary<Guid, Categoria> categorias,
        IReadOnlyDictionary<Guid, decimal> gastosPorCategoria,
        decimal totalGastos)
    {
        var categoria = p.CategoriaId is { } id ? categorias.GetValueOrDefault(id) : null;
        var gastado = p.CategoriaId is { } cid ? gastosPorCategoria.GetValueOrDefault(cid) : totalGastos;
        var porcentaje = decimal.Round(gastado / p.Monto * 100, 1);

        return new PresupuestoDto(
            p.Id, p.CategoriaId,
            p.CategoriaId is null ? "Presupuesto global" : categoria?.Nombre ?? "(categoría eliminada)",
            categoria?.Color, categoria?.Icono, categoria?.Comentario,
            p.Anio, p.Mes, p.Monto, gastado, p.Monto - gastado, porcentaje,
            Presupuesto.CalcularEstado(porcentaje));
    }

    private static void ValidarPeriodo(int anio, int mes)
    {
        if (anio is < 2000 or > 2100 || mes is < 1 or > 12)
            throw new ReglaNegocioException("El periodo indicado no es válido.");
    }
}
