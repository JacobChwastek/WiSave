using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using MongoDB.Driver;
using WiSave.Modules.Incomes.Projections.Documents;
using WiSave.Modules.Incomes.Projections.Models;
using WiSave.Modules.Incomes.Projections.Services;

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

        var result = await collection
            .Aggregate()
            .Match(filter)
            .Group(_ => 1, g => new { Total = g.Sum(x => x.Amount) })
            .FirstOrDefaultAsync(ct);

        return result?.Total ?? 0m;
    }

    public async Task<IEnumerable<string>> GetCategories([Service] IMongoCollection<IncomeDocument> collection, CancellationToken ct)
    {
        var field = new StringFieldDefinition<IncomeDocument, string>("Categories");
        var categories = await collection
            .Distinct(field, Builders<IncomeDocument>.Filter.Empty)
            .ToListAsync(ct);

        return categories.OrderBy(x => x);
    }

    public async Task<IncomeStats> GetIncomeStats([Service] IncomeStatsService statsService, bool includeNonRecurring = false, CancellationToken ct = default)
    {
        return await statsService.GetStats(includeNonRecurring, ct);
    }

    public async Task<IEnumerable<MonthlyIncomeStats>> GetIncomeMonthlyStats(
        [Service] IncomeStatsService statsService,
        int monthsBack = 12,
        CancellationToken ct = default)
    {
        return await statsService.GetMonthlyStats(monthsBack, ct);
    }
}
