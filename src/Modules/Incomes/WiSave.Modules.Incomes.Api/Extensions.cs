using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WiSave.Modules.Incomes.Projections;

namespace WiSave.Modules.Incomes.Api;

public static class Extensions
{
    public static IServiceCollection AddIncomesModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddProjections();

        return services;
    }
}
