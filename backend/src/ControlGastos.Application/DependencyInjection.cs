using ControlGastos.Application.Categorias;
using ControlGastos.Application.Configuraciones;
using ControlGastos.Application.Cuentas;
using ControlGastos.Application.Dashboard;
using ControlGastos.Application.Metas;
using ControlGastos.Application.Importacion;
using ControlGastos.Application.Movimientos;
using ControlGastos.Application.Notificaciones;
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
        services.AddScoped<ConfiguracionService>();
        services.AddScoped<RelojService>();
        services.AddScoped<ImportacionService>();
        services.AddScoped<NotificacionService>();
        services.AddScoped<DashboardService>();
        services.AddScoped<ReporteService>();
        return services;
    }
}
