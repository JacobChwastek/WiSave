using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WiSave.Shared.Abstractions.Modules;

namespace WiSave.Shared.Infrastructure.Modules;

public static class ModuleExtensions
{
    private static readonly List<IModule> RegisteredModules = [];

    public static IServiceCollection AddModules(this IServiceCollection services, IConfiguration configuration)
    {
        var modules = ModuleLoader.LoadModules().ToList();
        RegisteredModules.AddRange(modules);

        foreach (var module in modules)
        {
            module.Register(services, configuration);
        }

        return services;
    }

    public static IApplicationBuilder UseModules(this IApplicationBuilder app)
    {
        foreach (var module in RegisteredModules)
        {
            module.Use(app);
        }

        return app;
    }

    public static IEndpointRouteBuilder ExposeModules(this IEndpointRouteBuilder endpoints)
    {
        foreach (var module in RegisteredModules)
        {
            module.Expose(endpoints);
        }

        return endpoints;
    }

    public static IEnumerable<Type> GetAllGraphQLTypeExtensions()
    {
        return RegisteredModules.SelectMany(m => m.GetGraphQlTypeExtensions());
    }

    internal static IReadOnlyList<IModule> GetRegisteredModules() => RegisteredModules.AsReadOnly();
}
