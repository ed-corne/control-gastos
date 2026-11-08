using ControlGastos.Application.Cuentas;
using Microsoft.Extensions.DependencyInjection;

namespace ControlGastos.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CuentaService>();
        return services;
    }
}
