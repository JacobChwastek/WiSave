using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using MongoDB.Driver;
using WiSave.Modules.Incomes.Projections.Documents;

namespace WiSave.Modules.Incomes.Projections.GraphQL;

[ExtendObjectType(OperationTypeNames.Query)]
public sealed class IncomeQueries
{
    [UsePaging(IncludeTotalCount = true)]
    [UseFiltering]
    [UseSorting]
    public IExecutable<IncomeDocument> GetIncomes([Service] IMongoCollection<IncomeDocument> collection)
    {
        return collection.AsExecutable();
    }       

    public async Task<IncomeDocument?> GetIncomeById(string id, [Service] IMongoCollection<IncomeDocument> collection, CancellationToken ct)
    {
        return await collection.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<decimal> GetTotalAmount([Service] IMongoCollection<IncomeDocument> collection, string? currency, CancellationToken ct)
    {
        var filter = string.IsNullOrEmpty(currency)
            ? Builders<IncomeDocument>.Filter.Empty
            : Builders<IncomeDocument>.Filter.Eq(x => x.Currency, currency);

        var incomes = await collection.Find(filter).ToListAsync(ct);
        return incomes.Sum(x => x.Amount);
    }

    public async Task<IEnumerable<string>> GetCategories([Service] IMongoCollection<IncomeDocument> collection, CancellationToken ct)
    {
        var incomes = await collection.Find(_ => true).ToListAsync(ct);
        return incomes.SelectMany(x => x.Categories).Distinct().OrderBy(x => x);
    }
}
