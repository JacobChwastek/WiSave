using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WiSave.Modules.Incomes.Projections;
using WiSave.Modules.Incomes.Projections.GraphQL;
using WiSave.Shared.Abstractions.Modules;

namespace WiSave.Modules.Incomes.Api;

public sealed class IncomesModule : IModule
{
    public const string ModuleName = "Incomes";

    public string Name => ModuleName;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddProjections();
    }

    public void Use(IApplicationBuilder app)
    {
    }

    public void Expose(IEndpointRouteBuilder endpoints)
    {
    }

    public IEnumerable<Type> GetGraphQlTypeExtensions()
    {
        yield return typeof(IncomeQueries);
    }
}
