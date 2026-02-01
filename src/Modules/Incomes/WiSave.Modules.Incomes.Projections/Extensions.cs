using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using WiSave.Modules.Incomes.Projections.Documents;

namespace WiSave.Modules.Incomes.Projections;

public static class Extensions
{
    private const string ModuleName = "Incomes";
    private const string CollectionName = "Items";

    public static IServiceCollection AddProjections(this IServiceCollection services)
    {
        services.AddScoped<IMongoCollection<IncomeDocument>>(sp =>
        {
            var database = sp.GetRequiredService<IMongoDatabase>();
            return database.GetCollection<IncomeDocument>($"{ModuleName}_{CollectionName}");
        });

        return services;
    }
}
