using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace WiSave.Modules.Incomes.Core;

public static class Extensions
{
    public static IServiceCollection AddCore(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Future: Add command handlers, domain services, etc.
        return services;
    }
}
