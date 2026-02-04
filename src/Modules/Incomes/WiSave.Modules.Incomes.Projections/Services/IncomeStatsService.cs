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
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastMonth = startOfThisMonth.AddMonths(-1);
        var startOfTwoMonthsAgo = startOfThisMonth.AddMonths(-2);
        var startOfThreeMonthsAgo = startOfThisMonth.AddMonths(-3);

        var baseFilter = includeNonRecurring
            ? Builders<IncomeDocument>.Filter.Empty
            : Builders<IncomeDocument>.Filter.Eq(x => x.Recurring, true);

        var yearRecurring = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfThisYear, now, ct);

        var lastMonthRecurring = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfLastMonth, startOfThisMonth, ct);

        var twoMonthsAgoRecurring = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfTwoMonthsAgo, startOfLastMonth, ct);

        var thisMonthRecurring = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfThisMonth, now, ct);

        var last3FullMonthsRecurring = await MongoAggregationHelper.SumForPeriod(
            collection, baseFilter, x => x.Date, x => x.Amount, startOfThreeMonthsAgo, startOfThisMonth, ct);

        var last3MonthsAverage = last3FullMonthsRecurring / 3m;

        return new IncomeStats(
            yearRecurringTotal: yearRecurring,
            lastMonthRecurringTotal: lastMonthRecurring,
            lastMonthRecurringChangePct: StatisticsHelper.CalculateChangePercent(lastMonthRecurring, twoMonthsAgoRecurring),
            thisMonthRecurringTotal: thisMonthRecurring,
            thisMonthRecurringChangePct: StatisticsHelper.CalculateChangePercent(thisMonthRecurring, lastMonthRecurring),
            last3MonthsRecurringAverage: last3MonthsAverage
        );
    }

    public async Task<IEnumerable<MonthlyIncomeStats>> GetMonthlyStats(
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
}
