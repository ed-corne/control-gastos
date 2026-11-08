using ControlGastos.Application.Categorias;
using ControlGastos.Application.Cuentas;
using ControlGastos.Application.Movimientos;
using ControlGastos.Application.Presupuestos;
using ControlGastos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ControlGastos.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(o =>
            o.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICuentaRepository, CuentaRepository>();
        services.AddScoped<ICategoriaRepository, CategoriaRepository>();
        services.AddScoped<IMovimientoRepository, MovimientoRepository>();
        services.AddScoped<IPresupuestoRepository, PresupuestoRepository>();
        return services;
    }
}
