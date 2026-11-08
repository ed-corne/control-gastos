namespace ControlGastos.Application.Common;

public sealed record ResultadoPaginado<T>(IReadOnlyList<T> Items, int Total, int Pagina, int Tamano);
