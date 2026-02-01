using HotChocolate.Execution.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WiSave.Shared.Infrastructure.Modules;

namespace WiSave.Shared.Infrastructure.GraphQL;

public static class GraphQlExtensions
{
    public static IServiceCollection AddModularGraphQl(this IServiceCollection services)
    {
        var builder = services
            .AddGraphQLServer()
            .InitializeOnStartup()
            .AddQueryType()
            .AddMongoDbFiltering()
            .AddMongoDbSorting()
            .AddMongoDbPagingProviders()
            .AllowIntrospection(true)
            .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true)
            .ModifyCostOptions(opt => opt.EnforceCostLimits = false);

        foreach (var typeExtension in ModuleExtensions.GetAllGraphQLTypeExtensions())
        {
            builder.AddTypeExtension(typeExtension);
        }

        return services;
    }

    public static IRequestExecutorBuilder AddModuleTypeExtensions(this IRequestExecutorBuilder builder)
    {
        foreach (var typeExtension in ModuleExtensions.GetAllGraphQLTypeExtensions())
        {
            builder.AddTypeExtension(typeExtension);
        }

        return builder;
    }
}
