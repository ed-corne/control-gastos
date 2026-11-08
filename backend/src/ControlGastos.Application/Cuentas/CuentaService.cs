using ControlGastos.Domain.Cuentas;

namespace ControlGastos.Application.Cuentas;

public class CuentaService(ICuentaRepository repositorio)
{
    public async Task<IReadOnlyList<CuentaDto>> ListarAsync(bool incluirArchivadas, CancellationToken ct)
    {
        var cuentas = await repositorio.ListarAsync(incluirArchivadas, ct);
        return cuentas.Select(ToDto).ToList();
    }

    public async Task<CuentaDto?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var cuenta = await repositorio.ObtenerAsync(id, ct);
        return cuenta is null ? null : ToDto(cuenta);
    }

    public async Task<CuentaDto> CrearAsync(GuardarCuentaRequest request, CancellationToken ct)
    {
        var cuenta = new Cuenta();
        Aplicar(cuenta, request);
        await repositorio.AgregarAsync(cuenta, ct);
        return ToDto(cuenta);
    }

    public async Task<CuentaDto?> EditarAsync(Guid id, GuardarCuentaRequest request, CancellationToken ct)
    {
        var cuenta = await repositorio.ObtenerAsync(id, ct);
        if (cuenta is null) return null;

        Aplicar(cuenta, request);
        await repositorio.ActualizarAsync(cuenta, ct);
        return ToDto(cuenta);
    }

    /// <summary>RF-CTA-02: archivar conserva el historial; no se elimina nada.</summary>
    public async Task<CuentaDto?> CambiarArchivadaAsync(Guid id, bool archivada, CancellationToken ct)
    {
        var cuenta = await repositorio.ObtenerAsync(id, ct);
        if (cuenta is null) return null;

        cuenta.Archivada = archivada;
        await repositorio.ActualizarAsync(cuenta, ct);
        return ToDto(cuenta);
    }

    /// <summary>
    /// RF-CTA-04: suma las cuentas activas y resta lo que se debe en tarjetas de crédito.
    /// </summary>
    public async Task<ResumenCuentasDto> ObtenerResumenAsync(CancellationToken ct)
    {
        var cuentas = await repositorio.ListarAsync(incluirArchivadas: false, ct);

        var activos = cuentas.Where(c => c.Tipo != TipoCuenta.Credito).Sum(CalcularSaldoActual);
        var deuda = cuentas.Where(c => c.Tipo == TipoCuenta.Credito).Sum(CalcularSaldoActual);

        return new ResumenCuentasDto(activos - deuda, activos, deuda, cuentas.Count);
    }

    private static void Aplicar(Cuenta cuenta, GuardarCuentaRequest r)
    {
        cuenta.Nombre = r.Nombre.Trim();
        cuenta.Tipo = r.Tipo;
        cuenta.SaldoInicial = decimal.Round(r.SaldoInicial, 2);
        cuenta.Color = r.Color;
        cuenta.Icono = r.Icono.Trim();
    }

    // RF-CTA-03: cuando exista el módulo de movimientos se sumarán ingresos, gastos y transferencias.
    private static decimal CalcularSaldoActual(Cuenta c) => c.SaldoInicial;

    private static CuentaDto ToDto(Cuenta c) =>
        new(c.Id, c.Nombre, c.Tipo, c.SaldoInicial, CalcularSaldoActual(c), c.Color, c.Icono, c.Archivada);
}
