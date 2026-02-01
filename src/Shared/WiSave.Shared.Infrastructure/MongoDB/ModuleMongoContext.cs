using MongoDB.Driver;
using WiSave.Shared.Abstractions.Projections;

namespace WiSave.Shared.Infrastructure.MongoDB;

public sealed class ModuleMongoContext(IMongoDatabase database, string moduleName) : IModuleMongoContext
{
    public string ModuleName { get; } = moduleName;

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        var prefixedName = $"{ModuleName}_{collectionName}";
        return database.GetCollection<T>(prefixedName);
    }
}
