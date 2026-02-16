using MongoDB.Bson;
using MongoDB.Driver;
using WiSave.Modules.Incomes.Projections.Documents;
using WiSave.Modules.Incomes.Projections.Models;
using WiSave.Shared.Abstractions.Projections;
using WiSave.Shared.Infrastructure.MongoDB;

namespace WiSave.Modules.Incomes.Projections.Services;

public sealed class IncomeStatsService(IMongoCollection<IncomeDocument> collection)
{
    public async Task<IncomeStats> GetStats(bool includeNonRecurring = false, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var startOfThisYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastYear = new DateTime(now.Year - 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfThreeMonthsAgo = startOfThisMonth.AddMonths(-3);

        var baseFilter = includeNonRecurring
            ? Builders<IncomeDocument>.Filter.Empty
            : Builders<IncomeDocument>.Filter.Eq(x => x.Recurring, true);

        var lastYearTotal = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfLastYear, startOfThisYear, ct);

        var thisYearTotal = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfThisYear, now, ct);

        var thisMonthTotal = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfThisMonth, now, ct);

        var last3FullMonths = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfThreeMonthsAgo, startOfThisMonth, ct);

        return new IncomeStats(
            LastYearTotal: lastYearTotal,
            ThisYearTotal: thisYearTotal,
            ThisMonthTotal: thisMonthTotal,
            Last3MonthsAverage: last3FullMonths / 3m,
            LastYearMonthlyAverage: lastYearTotal / 12m
        );
    }

    public async Task<IEnumerable<MonthlyIncomeStats>> GetMonthlyStats(
        int year,
        CancellationToken ct = default)
    {
        var startMonth = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endMonth = new DateTime(year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);

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
                        { "year", new BsonDocument("$year", "$date") },
                        { "month", new BsonDocument("$month", "$date") },
                        { "recurring", new BsonDocument("$ifNull", new BsonArray { "$recurring", false }) }
                    }
                },
                { "total", new BsonDocument("$sum", "$amount") }
            })
        };

        var results = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync(ct);

        var grouped = results
            .Where(doc =>
            {
                var id = doc["_id"].AsBsonDocument;
                return id["year"].BsonType != BsonType.Null && id["month"].BsonType != BsonType.Null;
            })
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
                Year: cursor.Year,
                Month: cursor.Month,
                RecurringTotal: recurring,
                NonRecurringTotal: nonRecurring
            ));

            cursor = cursor.AddMonths(1);
        }

        return stats;
    }
}
