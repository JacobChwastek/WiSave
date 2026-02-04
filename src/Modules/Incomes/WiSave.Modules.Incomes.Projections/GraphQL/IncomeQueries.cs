using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using MongoDB.Bson;
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

    public async Task<IncomeStats> GetIncomeStats([Service] IMongoCollection<IncomeDocument> collection, bool includeNonRecurring = false, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var startOfThisYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastMonth = startOfThisMonth.AddMonths(-1);
        var startOfTwoMonthsAgo = startOfThisMonth.AddMonths(-2);
        var startOfThreeMonthsAgo = startOfThisMonth.AddMonths(-3);

        var baseFilter = includeNonRecurring
            ? Builders<IncomeDocument>.Filter.Empty
            : Builders<IncomeDocument>.Filter.Eq(x => x.Recurring, true);

        var yearRecurring = await SumForPeriod(collection, baseFilter, startOfThisYear, now, ct);
        var lastMonthRecurring = await SumForPeriod(collection, baseFilter, startOfLastMonth, startOfThisMonth, ct);
        var twoMonthsAgoRecurring = await SumForPeriod(collection, baseFilter, startOfTwoMonthsAgo, startOfLastMonth, ct);
        var thisMonthRecurring = await SumForPeriod(collection, baseFilter, startOfThisMonth, now, ct);

        var last3FullMonthsRecurring = await SumForPeriod(collection, baseFilter, startOfThreeMonthsAgo, startOfThisMonth, ct);
        var last3MonthsAverage = last3FullMonthsRecurring / 3m;

        return new IncomeStats(
            yearRecurringTotal: yearRecurring,
            lastMonthRecurringTotal: lastMonthRecurring,
            lastMonthRecurringChangePct: CalculateChangePercent(lastMonthRecurring, twoMonthsAgoRecurring),
            thisMonthRecurringTotal: thisMonthRecurring,
            thisMonthRecurringChangePct: CalculateChangePercent(thisMonthRecurring, lastMonthRecurring),
            last3MonthsRecurringAverage: last3MonthsAverage
        );
    }

    public async Task<IEnumerable<MonthlyIncomeStats>> GetIncomeMonthlyStats(
        [Service] IMongoCollection<IncomeDocument> collection,
        int monthsBack = 12,
        CancellationToken ct = default)
    {
        if (monthsBack < 1)
        {
            return Enumerable.Empty<MonthlyIncomeStats>();
        }

        var now = DateTime.UtcNow;
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startMonth = startOfThisMonth.AddMonths(-(monthsBack - 1));
        var endMonth = startOfThisMonth.AddMonths(1);

        var dateFilter = Builders<IncomeDocument>.Filter.Gte(x => x.Date, startMonth)
            & Builders<IncomeDocument>.Filter.Lt(x => x.Date, endMonth);

        var pipeline = new[]
        {
            new BsonDocument("$match", dateFilter.Render(new RenderArgs<IncomeDocument>(
                collection.DocumentSerializer,
                collection.Settings.SerializerRegistry))),
            new BsonDocument("$group", new BsonDocument
            {
                {
                    "_id", new BsonDocument
                    {
                        { "year", new BsonDocument("$year", "$Date") },
                        { "month", new BsonDocument("$month", "$Date") },
                        { "recurring", new BsonDocument("$ifNull", new BsonArray { "$Recurring", false }) }
                    }
                },
                { "total", new BsonDocument("$sum", "$Amount") }
            })
        };

        var results = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync(ct);

        var grouped = results
            .Select(doc =>
            {
                var id = doc["_id"].AsBsonDocument;
                return new
                {
                    Year = id["year"].AsInt32,
                    Month = id["month"].AsInt32,
                    Recurring = id["recurring"].BsonType != BsonType.Null && id["recurring"].AsBoolean,
                    Total = doc["total"].ToDecimal()
                };
            })
            .GroupBy(x => (x.Year, x.Month))
            .ToDictionary(
                g => g.Key,
                g => new
                {
                    Recurring = g.Where(x => x.Recurring).Sum(x => x.Total),
                    NonRecurring = g.Where(x => !x.Recurring).Sum(x => x.Total)
                });

        var stats = new List<MonthlyIncomeStats>();
        var cursor = startMonth;

        while (cursor < endMonth)
        {
            var key = (cursor.Year, cursor.Month);
            var recurring = grouped.TryGetValue(key, out var totals) ? totals.Recurring : 0m;
            var nonRecurring = grouped.TryGetValue(key, out totals) ? totals.NonRecurring : 0m;

            stats.Add(new MonthlyIncomeStats(
                year: cursor.Year,
                month: cursor.Month,
                recurringTotal: recurring,
                nonRecurringTotal: nonRecurring,
                total: recurring + nonRecurring
            ));

            cursor = cursor.AddMonths(1);
        }

        return stats;
    }

    private static async Task<decimal> SumForPeriod(
        IMongoCollection<IncomeDocument> collection,
        FilterDefinition<IncomeDocument> baseFilter,
        DateTime start,
        DateTime end,
        CancellationToken ct)
    {
        var dateFilter = Builders<IncomeDocument>.Filter.Gte(x => x.Date, start)
            & Builders<IncomeDocument>.Filter.Lt(x => x.Date, end);

        var filter = baseFilter & dateFilter;

        var result = await collection
            .Aggregate()
            .Match(filter)
            .Group(_ => 1, g => new { Total = g.Sum(x => x.Amount) })
            .FirstOrDefaultAsync(ct);

        return result?.Total ?? 0m;
    }

    private static decimal? CalculateChangePercent(decimal current, decimal previous)
    {
        if (previous == 0)
        {
            return null;
        }

        return (current - previous) / previous * 100m;
    }
}

public sealed record IncomeStats(
    decimal yearRecurringTotal,
    decimal lastMonthRecurringTotal,
    decimal? lastMonthRecurringChangePct,
    decimal thisMonthRecurringTotal,
    decimal? thisMonthRecurringChangePct,
    decimal last3MonthsRecurringAverage
);

public sealed record MonthlyIncomeStats(
    int year,
    int month,
    decimal recurringTotal,
    decimal nonRecurringTotal,
    decimal total
);
