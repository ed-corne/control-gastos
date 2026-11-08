using System.Globalization;
using ControlGastos.Application.Categorias;
using ControlGastos.Application.Common;
using ControlGastos.Application.Configuraciones;
using ControlGastos.Application.Cuentas;
using ControlGastos.Application.Movimientos;
using ControlGastos.Domain.Categorias;
using ControlGastos.Domain.Cuentas;
using ControlGastos.Domain.Movimientos;

namespace ControlGastos.Application.Importacion;

public class ImportacionService(
    ICuentaRepository cuentas,
    ICategoriaRepository categorias,
    IMovimientoRepository movimientos,
    RelojService reloj)
{
    /// <summary>
    /// RF-IMP-02 y RF-IMP-03: valida las filas, detecta posibles duplicados (misma fecha, monto y cuenta)
    /// y, si no es solo validación, guarda todas las filas aceptadas en una sola operación.
    /// </summary>
    public async Task<ResultadoImportacionDto> ImportarAsync(ImportarMovimientosRequest request, CancellationToken ct)
    {
        if (request.Filas.Count == 0)
            throw new ReglaNegocioException("El archivo no tiene filas para importar.");

        var hoy = await reloj.HoyAsync(ct);
        var cuentasActivas = await cuentas.ListarAsync(false, ct);
        var categoriasActivas = await categorias.ListarAsync(null, false, ct);

        Cuenta? predeterminada = null;
        if (request.CuentaPredeterminadaId is { } idPredeterminada)
        {
            predeterminada = await cuentas.ObtenerAsync(idPredeterminada, ct)
                ?? throw new ReglaNegocioException("La cuenta predeterminada no existe.");
            if (predeterminada.Archivada)
                throw new ReglaNegocioException("La cuenta predeterminada está archivada.");
        }

        // Claves de lo que ya existe, limitadas al rango de fechas del archivo.
        var fechas = request.Filas.Select(f => TryFecha(f.Fecha)).Where(f => f is not null).Select(f => f!.Value).ToList();
        var existentes = fechas.Count == 0
            ? []
            : await movimientos.ObtenerClavesAsync(fechas.Min(), fechas.Max(), ct);
        var vistasEnArchivo = new HashSet<(DateOnly, decimal, Guid)>();

        var resultados = new List<ResultadoFilaDto>();
        var aGuardar = new List<Movimiento>();

        foreach (var fila in request.Filas)
        {
            var (movimiento, error, aviso) = Convertir(
                fila, request, hoy, cuentasActivas, categoriasActivas, predeterminada);

            if (movimiento is null)
            {
                resultados.Add(new ResultadoFilaDto(fila.Numero, EstadoFila.Error, error));
                continue;
            }

            var clave = (movimiento.Fecha, movimiento.Monto, movimiento.CuentaId);
            var esDuplicada = existentes.Contains(clave) || !vistasEnArchivo.Add(clave);

            if (esDuplicada)
            {
                resultados.Add(new ResultadoFilaDto(fila.Numero, EstadoFila.Duplicada,
                    "Ya existe un movimiento con la misma fecha, monto y cuenta."));
                if (request.OmitirDuplicados) continue;
            }
            else
            {
                resultados.Add(new ResultadoFilaDto(fila.Numero, EstadoFila.Valida, aviso));
            }

            aGuardar.Add(movimiento);
        }

        var importadas = 0;
        if (!request.SoloValidar && aGuardar.Count > 0)
        {
            await movimientos.AgregarVariosAsync(aGuardar, ct);
            importadas = aGuardar.Count;
        }

        return new ResultadoImportacionDto(
            request.Filas.Count,
            resultados.Count(r => r.Estado == EstadoFila.Valida),
            resultados.Count(r => r.Estado == EstadoFila.Duplicada),
            resultados.Count(r => r.Estado == EstadoFila.Error),
            importadas,
            resultados);
    }

    private static (Movimiento? Movimiento, string? Error, string? Aviso) Convertir(
        FilaImportacion f,
        ImportarMovimientosRequest request,
        DateOnly hoy,
        IReadOnlyList<Cuenta> cuentasActivas,
        IReadOnlyList<Categoria> categoriasActivas,
        Cuenta? predeterminada)
    {
        if (TryFecha(f.Fecha) is not { } fecha)
            return (null, "La fecha no es válida.", null);
        if (fecha > hoy)
            return (null, "La fecha es posterior a hoy.", null);

        if (f.Monto is not { } monto || monto == 0)
            return (null, "El monto está vacío o es 0.", null);
        if (decimal.Round(monto, 2) != monto)
            return (null, "El monto tiene más de 2 decimales.", null);
        if (Math.Abs(monto) > 999_999_999_999m)
            return (null, "El monto es demasiado grande.", null);

        TipoMovimiento tipo;
        if (!string.IsNullOrWhiteSpace(f.Tipo))
        {
            if (f.Tipo.Trim().Equals("Gasto", StringComparison.OrdinalIgnoreCase)) tipo = TipoMovimiento.Gasto;
            else if (f.Tipo.Trim().Equals("Ingreso", StringComparison.OrdinalIgnoreCase)) tipo = TipoMovimiento.Ingreso;
            else return (null, $"El tipo “{f.Tipo}” no es válido (usa Gasto o Ingreso).", null);
        }
        else
        {
            var positivo = monto > 0;
            tipo = positivo == request.PositivosSonGastos ? TipoMovimiento.Gasto : TipoMovimiento.Ingreso;
        }

        var tipoCategoria = tipo == TipoMovimiento.Gasto ? TipoCategoria.Gasto : TipoCategoria.Ingreso;
        var delTipo = categoriasActivas.Where(c => c.Tipo == tipoCategoria).ToList();

        string? aviso = null;
        var categoria = string.IsNullOrWhiteSpace(f.Categoria)
            ? null
            : delTipo.FirstOrDefault(c => c.Nombre.Equals(f.Categoria.Trim(), StringComparison.OrdinalIgnoreCase));

        if (categoria is null)
        {
            categoria = delTipo.FirstOrDefault(c => c.Nombre.Equals("Otros", StringComparison.OrdinalIgnoreCase));
            if (categoria is null)
                return (null, $"No existe la categoría “{f.Categoria}” y no hay una categoría “Otros”.", null);

            aviso = string.IsNullOrWhiteSpace(f.Categoria)
                ? "Sin categoría: se usará “Otros”."
                : $"La categoría “{f.Categoria.Trim()}” no existe: se usará “Otros”.";
        }

        var cuenta = string.IsNullOrWhiteSpace(f.Cuenta)
            ? null
            : cuentasActivas.FirstOrDefault(c => c.Nombre.Equals(f.Cuenta.Trim(), StringComparison.OrdinalIgnoreCase));
        cuenta ??= predeterminada;
        if (cuenta is null)
            return (null, "No se encontró la cuenta y no hay una cuenta predeterminada.", null);

        return (new Movimiento
        {
            Tipo = tipo,
            Monto = Math.Abs(monto),
            Fecha = fecha,
            Descripcion = string.IsNullOrWhiteSpace(f.Descripcion) ? null : f.Descripcion.Trim(),
            CuentaId = cuenta.Id,
            CategoriaId = categoria.Id,
        }, null, aviso);
    }

    private static DateOnly? TryFecha(string? texto) =>
        DateOnly.TryParseExact(texto, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var f)
            ? f
            : null;
}
