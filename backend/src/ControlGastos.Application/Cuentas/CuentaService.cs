using ControlGastos.Application.Common;
using ControlGastos.Domain.Cuentas;

namespace ControlGastos.Application.Cuentas;

public class CuentaService(ICuentaRepository repositorio)
{
    public async Task<IReadOnlyList<CuentaDto>> ListarAsync(bool incluirArchivadas, CancellationToken ct)
    {
        var cuentas = await repositorio.ListarAsync(incluirArchivadas, ct);
        var neto = await repositorio.ObtenerMovimientoNetoAsync(ct);
        return cuentas.Select(c => ToDto(c, neto)).ToList();
    }

    public async Task<CuentaDto?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var cuenta = await repositorio.ObtenerAsync(id, ct);
        return cuenta is null ? null : ToDto(cuenta, await repositorio.ObtenerMovimientoNetoAsync(ct));
    }

    public async Task<CuentaDto> CrearAsync(GuardarCuentaRequest request, CancellationToken ct)
    {
        await ValidarNombreUnicoAsync(request.Nombre, excluirId: null, ct);

        var cuenta = new Cuenta();
        Aplicar(cuenta, request);
        await repositorio.AgregarAsync(cuenta, ct);
        return ToDto(cuenta, SinMovimientos);
    }

    public async Task<CuentaDto?> EditarAsync(Guid id, GuardarCuentaRequest request, CancellationToken ct)
    {
        var cuenta = await repositorio.ObtenerAsync(id, ct);
        if (cuenta is null) return null;

        await ValidarNombreUnicoAsync(request.Nombre, excluirId: id, ct);

        Aplicar(cuenta, request);
        await repositorio.ActualizarAsync(cuenta, ct);
        return ToDto(cuenta, await repositorio.ObtenerMovimientoNetoAsync(ct));
    }

    /// <summary>RF-CTA-02: archivar conserva el historial; no se elimina nada.</summary>
    public async Task<CuentaDto?> CambiarArchivadaAsync(Guid id, bool archivada, CancellationToken ct)
    {
        var cuenta = await repositorio.ObtenerAsync(id, ct);
        if (cuenta is null) return null;

        cuenta.Archivada = archivada;
        await repositorio.ActualizarAsync(cuenta, ct);
        return ToDto(cuenta, await repositorio.ObtenerMovimientoNetoAsync(ct));
    }

    /// <summary>RF-CTA-06: una cuenta con movimientos solo se puede archivar.</summary>
    public async Task<bool> EliminarAsync(Guid id, CancellationToken ct)
    {
        if (await repositorio.ObtenerAsync(id, ct) is null) return false;

        if (await repositorio.TieneMovimientosAsync(id, ct))
            throw new ReglaNegocioException("No se puede eliminar una cuenta que tiene movimientos; solo archivarla.");

        await repositorio.EliminarAsync(id, ct);
        return true;
    }

    /// <summary>
    /// RF-CTA-04: suma las cuentas activas y resta lo que se debe en tarjetas de crédito.
    /// </summary>
    public async Task<ResumenCuentasDto> ObtenerResumenAsync(CancellationToken ct)
    {
        var cuentas = await repositorio.ListarAsync(incluirArchivadas: false, ct);
        var neto = await repositorio.ObtenerMovimientoNetoAsync(ct);

        var activos = cuentas.Where(c => c.Tipo != TipoCuenta.Credito).Sum(c => CalcularSaldoActual(c, neto));
        var deuda = cuentas.Where(c => c.Tipo == TipoCuenta.Credito).Sum(c => CalcularSaldoActual(c, neto));

        return new ResumenCuentasDto(activos - deuda, activos, deuda, cuentas.Count);
    }

    private async Task ValidarNombreUnicoAsync(string nombre, Guid? excluirId, CancellationToken ct)
    {
        if (await repositorio.ExisteNombreAsync(nombre.Trim(), excluirId, ct))
            throw new ReglaNegocioException($"Ya existe una cuenta llamada “{nombre.Trim()}”.");
    }

    private static readonly IReadOnlyDictionary<Guid, decimal> SinMovimientos = new Dictionary<Guid, decimal>();

    private static void Aplicar(Cuenta cuenta, GuardarCuentaRequest r)
    {
        cuenta.Nombre = r.Nombre.Trim();
        cuenta.Tipo = r.Tipo;
        cuenta.SaldoInicial = decimal.Round(r.SaldoInicial, 2);
        cuenta.Color = r.Color;
        cuenta.Icono = r.Icono.Trim();
    }

    /// <summary>
    /// RF-CTA-03: saldo inicial + ingresos − gastos ± transferencias.
    /// En una tarjeta de crédito el saldo es la deuda, así que el efecto se invierte:
    /// un gasto la aumenta y un pago (transferencia recibida) la reduce.
    /// </summary>
    private static decimal CalcularSaldoActual(Cuenta c, IReadOnlyDictionary<Guid, decimal> neto)
    {
        var efecto = neto.GetValueOrDefault(c.Id);
        return c.Tipo == TipoCuenta.Credito ? c.SaldoInicial - efecto : c.SaldoInicial + efecto;
    }

    private static CuentaDto ToDto(Cuenta c, IReadOnlyDictionary<Guid, decimal> neto) =>
        new(c.Id, c.Nombre, c.Tipo, c.SaldoInicial, CalcularSaldoActual(c, neto), c.Color, c.Icono, c.Archivada);
}
