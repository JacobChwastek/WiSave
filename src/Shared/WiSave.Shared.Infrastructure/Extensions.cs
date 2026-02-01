using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WiSave.Shared.Infrastructure.GraphQL;
using WiSave.Shared.Infrastructure.Modules;
using WiSave.Shared.Infrastructure.MongoDB;

namespace WiSave.Shared.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddModularInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMongoDb(configuration);
        services.AddModules(configuration);
        services.AddModularGraphQl();

        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return services;
    }

    public static IApplicationBuilder UseModularInfrastructure(this IApplicationBuilder app)
    {
        app.UseCors();
        app.UseModules();

        return app;
    }
}
