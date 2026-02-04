using System.Linq.Expressions;
using MongoDB.Bson;
using MongoDB.Driver;

namespace WiSave.Shared.Infrastructure.MongoDB;

public static class MongoAggregationHelper
{
    public static async Task<decimal> SumForPeriod<TDocument>(
        IMongoCollection<TDocument> collection,
        FilterDefinition<TDocument> baseFilter,
        Expression<Func<TDocument, DateTime>> dateSelector,
        Expression<Func<TDocument, decimal>> amountSelector,
        DateTime start,
        DateTime end,
        CancellationToken ct)
    {
        var dateFilter = Builders<TDocument>.Filter.Gte(dateSelector, start)
            & Builders<TDocument>.Filter.Lt(dateSelector, end);

        var filter = baseFilter & dateFilter;
        var amountFieldName = GetMemberName(amountSelector);

        var groupStage = new BsonDocument("$group", new BsonDocument
        {
            { "_id", BsonNull.Value },
            { "total", new BsonDocument("$sum", $"${amountFieldName}") }
        });

        var result = await collection
            .Aggregate()
            .Match(filter)
            .AppendStage<BsonDocument>(groupStage)
            .FirstOrDefaultAsync(ct);

        return result?["total"].ToDecimal() ?? 0m;
    }

    private static string GetMemberName<TDocument, TProperty>(Expression<Func<TDocument, TProperty>> expression)
    {
        if (expression.Body is MemberExpression member)
        {
            return member.Member.Name;
        }

        throw new ArgumentException("Expression must be a member access expression.");
    }
}
