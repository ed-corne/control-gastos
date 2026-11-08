namespace ControlGastos.Application.Common;

/// <summary>
/// Se lanza cuando una operación viola una regla de negocio (la API la responde como 409).
/// </summary>
public class ReglaNegocioException(string mensaje) : Exception(mensaje);
