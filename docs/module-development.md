# Module Development Guide

How to add a new module to WiSave. Uses the Incomes module as reference.

## Project Structure

Create two projects under `src/Modules/{ModuleName}/`:

```
src/Modules/{ModuleName}/
├── WiSave.Modules.{Name}.Api/
│   ├── {Name}Module.cs              # IModule implementation
│   └── Extensions.cs                # (optional) API-level DI
└── WiSave.Modules.{Name}.Projections/
    ├── Documents/
    │   └── {Name}Document.cs        # MongoDB read model
    ├── GraphQL/
    │   └── {Name}Queries.cs         # GraphQL query type extension
    ├── Services/
    │   └── {Name}Service.cs         # (optional) complex query logic
    └── Extensions.cs                # Projection DI registration
```

The `.Api` project references `.Projections` and `WiSave.Shared.Abstractions`.
The `.Projections` project references `WiSave.Shared.Infrastructure` for MongoDB/GraphQL.

## Step 1: Define the Read Model

Create a document class representing your MongoDB projection:

```csharp
// Projections/Documents/ExpenseDocument.cs
namespace WiSave.Modules.Expenses.Projections.Documents;

public sealed class ExpenseDocument
{
    public required string Id { get; init; }
    public required DateTime Date { get; init; }
    public required string Description { get; init; }
    public required decimal Amount { get; init; }
    public required string Currency { get; init; }
    public DateTime CreatedAt { get; init; }
}
```

Reference: [`IncomeDocument.cs`](../src/Modules/Incomes/WiSave.Modules.Incomes.Projections/Documents/IncomeDocument.cs)

## Step 2: Register the MongoDB Collection

Each module prefixes its collections with the module name for isolation:

```csharp
// Projections/Extensions.cs
public static class Extensions
{
    private const string ModuleName = "Expenses";
    private const string CollectionName = "Items";

    public static IServiceCollection AddProjections(this IServiceCollection services)
    {
        services.AddScoped<IMongoCollection<ExpenseDocument>>(sp =>
        {
            var database = sp.GetRequiredService<IMongoDatabase>();
            return database.GetCollection<ExpenseDocument>($"{ModuleName}_{CollectionName}");
        });

        return services;
    }
}
```

This creates a MongoDB collection named `Expenses_Items`. The naming convention `{ModuleName}_{CollectionName}` ensures modules don't collide.

Reference: [`Extensions.cs`](../src/Modules/Incomes/WiSave.Modules.Incomes.Projections/Extensions.cs)

## Step 3: Add GraphQL Queries

Extend the root `Query` type using `[ExtendObjectType]`:

```csharp
// Projections/GraphQL/ExpenseQueries.cs
[ExtendObjectType(OperationTypeNames.Query)]
public sealed class ExpenseQueries
{
    [UsePaging(IncludeTotalCount = true)]
    [UseFiltering]
    [UseSorting]
    public IExecutable<ExpenseDocument> GetExpenses(
        [Service] IMongoCollection<ExpenseDocument> collection)
    {
        return collection.AsExecutable();
    }

    public async Task<ExpenseDocument?> GetExpenseById(
        string id,
        [Service] IMongoCollection<ExpenseDocument> collection,
        CancellationToken ct)
    {
        return await collection.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
    }
}
```

Key attributes:
- `[ExtendObjectType(OperationTypeNames.Query)]` -- adds fields to the root Query type
- `[UsePaging]` -- Hot Chocolate Relay cursor pagination
- `[UseFiltering]` / `[UseSorting]` -- auto-generates filter/sort input types from the document model
- `[Service]` -- injects from DI

Reference: [`IncomeQueries.cs`](../src/Modules/Incomes/WiSave.Modules.Incomes.Projections/GraphQL/IncomeQueries.cs)

## Step 4: Implement the Module

Create the `IModule` implementation that wires everything together:

```csharp
// Api/ExpensesModule.cs
public sealed class ExpensesModule : IModule
{
    public const string ModuleName = "Expenses";

    public string Name => ModuleName;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddProjections();
    }

    public void Use(IApplicationBuilder app) { }

    public void Expose(IEndpointRouteBuilder endpoints) { }

    public IEnumerable<Type> GetGraphQlTypeExtensions()
    {
        yield return typeof(ExpenseQueries);
    }
}
```

`GetGraphQlTypeExtensions()` tells the framework which types to register with Hot Chocolate.

Reference: [`IncomesModule.cs`](../src/Modules/Incomes/WiSave.Modules.Incomes.Api/IncomesModule.cs)

## Step 5: Reference from Bootstrapper

Add a project reference in the Bootstrapper `.csproj`:

```xml
<ProjectReference Include="..\..\Modules\Expenses\WiSave.Modules.Expenses.Api\WiSave.Modules.Expenses.Api.csproj" />
```

The `ModuleLoader` will automatically discover your module by scanning for `WiSave.Modules.*.dll` at startup.

## Step 6: Export and Update Schema

After adding new queries, update the GraphQL schema:

```bash
./scripts/export-schema.sh      # exports schema.graphql + ui/schema.graphql
cd ui && yarn codegen            # regenerate TypeScript types
```

Or in one step:

```bash
cd ui && yarn schema:update
```

## How Auto-Discovery Works

1. **Assembly scanning**: `ModuleLoader` finds all `WiSave.Modules.*.dll` files
2. **Type detection**: Finds classes implementing `IModule` via reflection
3. **Registration**: Calls `Register()` for DI and collects `GetGraphQlTypeExtensions()` results
4. **GraphQL composition**: `AddModularGraphQl()` registers all collected type extensions with Hot Chocolate

See [`ModuleLoader.cs`](../src/Shared/WiSave.Shared.Infrastructure/Modules/ModuleLoader.cs) and [`IModule.cs`](../src/Shared/WiSave.Shared.Abstractions/Modules/IModule.cs).

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Module class | `{Name}Module` | `ExpensesModule` |
| Document | `{Name}Document` | `ExpenseDocument` |
| MongoDB collection | `{Module}_{Collection}` | `Expenses_Items` |
| Query class | `{Name}Queries` | `ExpenseQueries` |
| Domain events | `{Entity}{Action}` | `ExpenseCreated` |
