namespace ControlGastos.Domain.Categorias;

public class Categoria
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public TipoCategoria Tipo { get; set; }
    public string Color { get; set; } = "#6b7280";
    public string Icono { get; set; } = "other";
    public string? Comentario { get; set; }
    public bool Archivada { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
