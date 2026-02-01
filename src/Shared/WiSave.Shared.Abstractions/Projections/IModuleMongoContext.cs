using MongoDB.Driver;

namespace WiSave.Shared.Abstractions.Projections;

public interface IModuleMongoContext
{
    string ModuleName { get; }
    IMongoCollection<T> GetCollection<T>(string collectionName);
}
