using ControlGastos.Domain.Cuentas;
using Microsoft.EntityFrameworkCore;

namespace ControlGastos.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Cuenta> Cuentas => Set<Cuenta>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cuenta>(e =>
        {
            e.ToTable("cuentas");
            e.HasKey(c => c.Id);
            e.Property(c => c.Nombre).HasMaxLength(100).IsRequired();
            e.Property(c => c.Tipo).HasConversion<string>().HasMaxLength(20);
            e.Property(c => c.SaldoInicial).HasPrecision(18, 2);
            e.Property(c => c.Color).HasMaxLength(7).IsRequired();
            e.Property(c => c.Icono).HasMaxLength(50).IsRequired();
            e.HasIndex(c => c.Archivada);
        });
    }
}
