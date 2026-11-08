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

    public virtual DbSet<Cuenta> Cuentas { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
