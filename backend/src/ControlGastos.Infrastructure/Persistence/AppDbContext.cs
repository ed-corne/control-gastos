using System;
using System.Collections.Generic;
using ControlGastos.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace ControlGastos.Infrastructure.Persistence;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Categoria> Categorias { get; set; }

    public virtual DbSet<Cuenta> Cuentas { get; set; }

    public virtual DbSet<Movimiento> Movimientos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_categorias");

            entity.ToTable("categorias");

            entity.HasIndex(e => e.Archivada, "ix_categorias_archivada");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Archivada).HasColumnName("archivada");
            entity.Property(e => e.Color)
                .HasMaxLength(7)
                .HasDefaultValueSql("'#6b7280'::character varying")
                .HasColumnName("color");
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_creacion");
            entity.Property(e => e.Icono)
                .HasMaxLength(50)
                .HasDefaultValueSql("'other'::character varying")
                .HasColumnName("icono");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.Tipo)
                .HasMaxLength(10)
                .HasColumnName("tipo");
        });

        modelBuilder.Entity<Cuenta>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_cuentas");

            entity.ToTable("cuentas");

            entity.HasIndex(e => e.Archivada, "ix_cuentas_archivada");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Archivada).HasColumnName("archivada");
            entity.Property(e => e.Color)
                .HasMaxLength(7)
                .HasDefaultValueSql("'#4f46e5'::character varying")
                .HasColumnName("color");
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_creacion");
            entity.Property(e => e.Icono)
                .HasMaxLength(50)
                .HasDefaultValueSql("'wallet'::character varying")
                .HasColumnName("icono");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .HasColumnName("nombre");
            entity.Property(e => e.SaldoInicial)
                .HasPrecision(18, 2)
                .HasColumnName("saldo_inicial");
            entity.Property(e => e.Tipo)
                .HasMaxLength(20)
                .HasColumnName("tipo");
        });

        modelBuilder.Entity<Movimiento>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_movimientos");

            entity.ToTable("movimientos");

            entity.HasIndex(e => e.CategoriaId, "ix_movimientos_categoria");

            entity.HasIndex(e => e.CuentaId, "ix_movimientos_cuenta");

            entity.HasIndex(e => e.CuentaDestinoId, "ix_movimientos_cuenta_destino");

            entity.HasIndex(e => e.Fecha, "ix_movimientos_fecha").IsDescending();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CategoriaId).HasColumnName("categoria_id");
            entity.Property(e => e.CuentaDestinoId).HasColumnName("cuenta_destino_id");
            entity.Property(e => e.CuentaId).HasColumnName("cuenta_id");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .HasColumnName("descripcion");
            entity.Property(e => e.Fecha).HasColumnName("fecha");
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("now()")
                .HasColumnName("fecha_creacion");
            entity.Property(e => e.Monto)
                .HasPrecision(18, 2)
                .HasColumnName("monto");
            entity.Property(e => e.Tipo)
                .HasMaxLength(15)
                .HasColumnName("tipo");

            entity.HasOne(d => d.Categoria).WithMany(p => p.Movimientos)
                .HasForeignKey(d => d.CategoriaId)
                .HasConstraintName("fk_movimientos_categoria");

            entity.HasOne(d => d.CuentaDestino).WithMany(p => p.MovimientoCuentaDestinos)
                .HasForeignKey(d => d.CuentaDestinoId)
                .HasConstraintName("fk_movimientos_cuenta_destino");

            entity.HasOne(d => d.Cuenta).WithMany(p => p.MovimientoCuenta)
                .HasForeignKey(d => d.CuentaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_movimientos_cuenta");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
