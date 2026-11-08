using ControlGastos.Application.Categorias;
using ControlGastos.Application.Common;
using ControlGastos.Application.Cuentas;
using ControlGastos.Domain.Categorias;
using ControlGastos.Domain.Cuentas;
using ControlGastos.Domain.Movimientos;

namespace ControlGastos.Application.Movimientos;

public class MovimientoService(
    IMovimientoRepository movimientos,
    ICuentaRepository cuentas,
    ICategoriaRepository categorias)
{
    private const int TamanoMaximo = 100;

    public async Task<ResultadoPaginado<MovimientoDto>> ListarAsync(FiltroMovimientos filtro, CancellationToken ct)
    {
        var pagina = Math.Max(1, filtro.Pagina);
        var tamano = Math.Clamp(filtro.Tamano, 1, TamanoMaximo);
        filtro = filtro with { Pagina = pagina, Tamano = tamano };

        var (items, total) = await movimientos.ListarAsync(filtro, ct);
        var dtos = await AdtosAsync(items, ct);
        return new ResultadoPaginado<MovimientoDto>(dtos, total, pagina, tamano);
    }

    public async Task<MovimientoDto?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var movimiento = await movimientos.ObtenerAsync(id, ct);
        return movimiento is null ? null : (await AdtosAsync([movimiento], ct))[0];
    }

    public async Task<MovimientoDto> CrearAsync(GuardarMovimientoRequest request, CancellationToken ct)
    {
        await ValidarReferenciasAsync(request, existente: null, ct);

        var movimiento = new Movimiento();
        Aplicar(movimiento, request);
        await movimientos.AgregarAsync(movimiento, ct);
        return (await AdtosAsync([movimiento], ct))[0];
    }

    public async Task<MovimientoDto?> EditarAsync(Guid id, GuardarMovimientoRequest request, CancellationToken ct)
    {
        var movimiento = await movimientos.ObtenerAsync(id, ct);
        if (movimiento is null) return null;

        await ValidarReferenciasAsync(request, movimiento, ct);

        Aplicar(movimiento, request);
        await movimientos.ActualizarAsync(movimiento, ct);
        return (await AdtosAsync([movimiento], ct))[0];
    }

    public Task<bool> EliminarAsync(Guid id, CancellationToken ct) => movimientos.EliminarAsync(id, ct);

    /// <summary>RF-MOV-02: última cuenta usada y categorías más frecuentes para el registro rápido.</summary>
    public async Task<SugerenciasMovimientoDto> ObtenerSugerenciasAsync(CancellationToken ct)
    {
        var ultima = await movimientos.UltimaCuentaUsadaAsync(ct);
        if (ultima is not null)
        {
            var cuenta = await cuentas.ObtenerAsync(ultima.Value, ct);
            if (cuenta is null || cuenta.Archivada) ultima = null;
        }

        return new SugerenciasMovimientoDto(
            ultima,
            await movimientos.CategoriasFrecuentesAsync(TipoMovimiento.Gasto, 5, ct),
            await movimientos.CategoriasFrecuentesAsync(TipoMovimiento.Ingreso, 5, ct));
    }

    private async Task ValidarReferenciasAsync(
        GuardarMovimientoRequest r, Movimiento? existente, CancellationToken ct)
    {
        await ValidarCuentaAsync(r.CuentaId, existente?.CuentaId, "origen", ct);

        if (r.Tipo == TipoMovimiento.Transferencia)
        {
            await ValidarCuentaAsync(r.CuentaDestinoId!.Value, existente?.CuentaDestinoId, "destino", ct);
            return;
        }

        var categoria = await categorias.ObtenerAsync(r.CategoriaId!.Value, ct)
            ?? throw new ReglaNegocioException("La categoría no existe.");

        var tipoEsperado = r.Tipo == TipoMovimiento.Gasto ? TipoCategoria.Gasto : TipoCategoria.Ingreso;
        if (categoria.Tipo != tipoEsperado)
            throw new ReglaNegocioException($"La categoría “{categoria.Nombre}” no es de {r.Tipo.ToString().ToLower()}.");

        if (categoria.Archivada && existente?.CategoriaId != categoria.Id)
            throw new ReglaNegocioException($"La categoría “{categoria.Nombre}” está archivada.");
    }

    private async Task ValidarCuentaAsync(Guid id, Guid? idActual, string rol, CancellationToken ct)
    {
        var cuenta = await cuentas.ObtenerAsync(id, ct)
            ?? throw new ReglaNegocioException($"La cuenta {rol} no existe.");

        // RF-CTA-02: una cuenta archivada ya no aparece al registrar movimientos.
        if (cuenta.Archivada && idActual != id)
            throw new ReglaNegocioException($"La cuenta “{cuenta.Nombre}” está archivada.");
    }

    private static void Aplicar(Movimiento m, GuardarMovimientoRequest r)
    {
        var esTransferencia = r.Tipo == TipoMovimiento.Transferencia;

        m.Tipo = r.Tipo;
        m.Monto = r.Monto;
        m.Fecha = r.Fecha;
        m.Descripcion = string.IsNullOrWhiteSpace(r.Descripcion) ? null : r.Descripcion.Trim();
        m.CuentaId = r.CuentaId;
        m.CuentaDestinoId = esTransferencia ? r.CuentaDestinoId : null;
        m.CategoriaId = esTransferencia ? null : r.CategoriaId;
    }

    private async Task<IReadOnlyList<MovimientoDto>> AdtosAsync(
        IReadOnlyList<Movimiento> lista, CancellationToken ct)
    {
        if (lista.Count == 0) return [];

        var porCuenta = (await cuentas.ListarAsync(true, ct)).ToDictionary(c => c.Id);
        var porCategoria = (await categorias.ListarAsync(null, true, ct)).ToDictionary(c => c.Id);

        return lista.Select(m =>
        {
            Cuenta? destino = m.CuentaDestinoId is { } d ? porCuenta.GetValueOrDefault(d) : null;
            Categoria? categoria = m.CategoriaId is { } c ? porCategoria.GetValueOrDefault(c) : null;

            return new MovimientoDto(
                m.Id, m.Tipo, m.Monto, m.Fecha, m.Descripcion,
                m.CuentaId, porCuenta[m.CuentaId].Nombre,
                m.CuentaDestinoId, destino?.Nombre,
                m.CategoriaId, categoria?.Nombre, categoria?.Color, categoria?.Icono);
        }).ToList();
    }
}
