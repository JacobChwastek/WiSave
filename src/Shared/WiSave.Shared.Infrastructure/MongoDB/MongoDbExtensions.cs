using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace WiSave.Shared.Infrastructure.MongoDB;

public static class MongoDbExtensions
{
    private static bool _conventionsRegistered;

    public static IServiceCollection AddMongoDb(this IServiceCollection services, IConfiguration configuration)
    {
        RegisterConventions();

        var connectionString = configuration.GetConnectionString("MongoDB")
            ?? throw new InvalidOperationException("MongoDB connection string is not configured. Set 'ConnectionStrings:MongoDB' in appsettings or environment variables.");

        var mongoClient = new MongoClient(connectionString);
        var mongoDatabase = mongoClient.GetDatabase("wisave");

        services.AddSingleton<IMongoClient>(mongoClient);
        services.AddSingleton(mongoDatabase);

        return services;
    }

    private static void RegisterConventions()
    {
        if (_conventionsRegistered) return;

        var conventionPack = new ConventionPack
        {
            new CamelCaseElementNameConvention(),
            new IgnoreExtraElementsConvention(true),
            new EnumRepresentationConvention(BsonType.String)
        };

        ConventionRegistry.Register("WiSaveConventions", conventionPack, _ => true);

        BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
        BsonSerializer.RegisterSerializer(new DecimalSerializer(BsonType.Decimal128));

        _conventionsRegistered = true;
    }
}
