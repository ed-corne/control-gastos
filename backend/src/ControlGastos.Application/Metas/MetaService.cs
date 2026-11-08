using ControlGastos.Application.Common;
using ControlGastos.Domain.Metas;

namespace ControlGastos.Application.Metas;

public class MetaService(IMetaRepository repositorio)
{
    public async Task<IReadOnlyList<MetaDto>> ListarAsync(bool cumplidas, CancellationToken ct)
    {
        var metas = await repositorio.ListarAsync(cumplidas, ct);
        var ahorrado = await repositorio.AhorradoPorMetaAsync(ct);
        return metas.Select(m => ToDto(m, ahorrado.GetValueOrDefault(m.Id))).ToList();
    }

    public async Task<MetaDto?> ObtenerAsync(Guid id, CancellationToken ct)
    {
        var meta = await repositorio.ObtenerAsync(id, ct);
        return meta is null ? null : await ADtoAsync(meta, ct);
    }

    public async Task<MetaDto> CrearAsync(GuardarMetaRequest request, CancellationToken ct)
    {
        var meta = new Meta();
        Aplicar(meta, request);
        await repositorio.AgregarAsync(meta, ct);
        return ToDto(meta, 0);
    }

    public async Task<MetaDto?> EditarAsync(Guid id, GuardarMetaRequest request, CancellationToken ct)
    {
        var meta = await repositorio.ObtenerAsync(id, ct);
        if (meta is null) return null;

        Aplicar(meta, request);

        // Cambiar el objetivo puede cumplir o reabrir la meta.
        var ahorrado = (await repositorio.AhorradoPorMetaAsync(ct)).GetValueOrDefault(id);
        ActualizarCumplimiento(meta, ahorrado);

        await repositorio.ActualizarAsync(meta, ct);
        return ToDto(meta, ahorrado);
    }

    public async Task<IReadOnlyList<OperacionMetaDto>?> ListarOperacionesAsync(Guid metaId, CancellationToken ct)
    {
        if (await repositorio.ObtenerAsync(metaId, ct) is null) return null;

        var operaciones = await repositorio.ListarOperacionesAsync(metaId, ct);
        return operaciones.Select(o => new OperacionMetaDto(o.Id, o.Tipo, o.Monto, o.Fecha, o.Nota)).ToList();
    }

    /// <summary>RF-MET-02: aportar o retirar dinero; cada operación queda registrada.</summary>
    public async Task<MetaDto?> RegistrarOperacionAsync(
        Guid metaId, RegistrarOperacionMetaRequest request, CancellationToken ct)
    {
        var meta = await repositorio.ObtenerAsync(metaId, ct);
        if (meta is null) return null;

        var ahorrado = (await repositorio.AhorradoPorMetaAsync(ct)).GetValueOrDefault(metaId);

        if (request.Tipo == TipoOperacionMeta.Retiro && request.Monto > ahorrado)
            throw new ReglaNegocioException("No puedes retirar más de lo que has ahorrado en esta meta.");

        await repositorio.AgregarOperacionAsync(new OperacionMeta
        {
            MetaId = metaId,
            Tipo = request.Tipo,
            Monto = request.Monto,
            Fecha = request.Fecha,
            Nota = string.IsNullOrWhiteSpace(request.Nota) ? null : request.Nota.Trim(),
        }, ct);

        ahorrado += request.Tipo == TipoOperacionMeta.Aportacion ? request.Monto : -request.Monto;

        // RF-MET-06: al llegar al 100 % pasa al historial; si un retiro la baja, vuelve a activas.
        var estabaCumplida = meta.Cumplida;
        ActualizarCumplimiento(meta, ahorrado);
        if (meta.Cumplida != estabaCumplida)
            await repositorio.ActualizarAsync(meta, ct);

        return ToDto(meta, ahorrado);
    }

    private async Task<MetaDto> ADtoAsync(Meta meta, CancellationToken ct) =>
        ToDto(meta, (await repositorio.AhorradoPorMetaAsync(ct)).GetValueOrDefault(meta.Id));

    private static void Aplicar(Meta meta, GuardarMetaRequest r)
    {
        meta.Nombre = r.Nombre.Trim();
        meta.MontoObjetivo = r.MontoObjetivo;
        meta.FechaLimite = r.FechaLimite;
        meta.Icono = r.Icono.Trim();
        meta.Color = r.Color;
    }

    private static void ActualizarCumplimiento(Meta meta, decimal ahorrado)
    {
        if (ahorrado >= meta.MontoObjetivo)
            meta.FechaCumplida ??= DateTime.UtcNow;
        else
            meta.FechaCumplida = null;
    }

    private static MetaDto ToDto(Meta m, decimal ahorrado)
    {
        var falta = Math.Max(0, m.MontoObjetivo - ahorrado);
        var porcentaje = decimal.Round(ahorrado / m.MontoObjetivo * 100, 1);

        decimal? semanal = null;
        var vencida = false;

        if (!m.Cumplida && m.FechaLimite is { } limite)
        {
            var hoy = DateOnly.FromDateTime(DateTime.Now);
            vencida = limite < hoy;

            // Semanas que quedan (se redondea hacia arriba); mínimo 1 para no dividir entre cero.
            var dias = limite.DayNumber - hoy.DayNumber;
            var semanas = Math.Max(1, (int)Math.Ceiling(dias / 7.0));
            semanal = decimal.Round(falta / semanas, 2);
        }

        return new MetaDto(
            m.Id, m.Nombre, m.MontoObjetivo, m.FechaLimite, m.Icono, m.Color,
            ahorrado, falta, porcentaje, m.Cumplida, m.FechaCumplida, semanal, vencida);
    }
}
