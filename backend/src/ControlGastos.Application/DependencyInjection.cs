using ControlGastos.Application.Categorias;
using ControlGastos.Application.Cuentas;
using ControlGastos.Application.Dashboard;
using ControlGastos.Application.Metas;
using ControlGastos.Application.Movimientos;
using ControlGastos.Application.Presupuestos;
using ControlGastos.Application.Reportes;
using Microsoft.Extensions.DependencyInjection;

namespace ControlGastos.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CuentaService>();
        services.AddScoped<CategoriaService>();
        services.AddScoped<MovimientoService>();
        services.AddScoped<PresupuestoService>();
        services.AddScoped<MetaService>();
        services.AddScoped<DashboardService>();
        services.AddScoped<ReporteService>();
        return services;
    }
}
