# GraphQL Workflow

End-to-end guide covering schema management, code generation, and frontend integration.

## Schema Management

The Hot Chocolate runtime schema is the **canonical source of truth**. The `schema.graphql` file at the repo root is an export -- never edit it manually.

### Workflow

```
 .NET Resolvers (code-first)
        │
        ▼
 Hot Chocolate builds schema at startup
        │
        ▼
 export-schema.sh ──► schema.graphql (repo root)
        │                    │
        │                    ├──► ui/schema.graphql (local copy)
        │                    │         │
        │                    │         ▼
        │                    │    yarn codegen
        │                    │         │
        │                    │         ▼
        │                    │    Generated TypeScript types
        │                    │
        ▼                    ▼
 check-schema.sh ──► diff (CI gate)
```

### Commands

```bash
# Export schema from the running server definition
./scripts/export-schema.sh

# Check schema is up to date (CI)
./scripts/check-schema.sh

# Export + regenerate frontend types in one step
cd ui && yarn schema:update

# Regenerate frontend types only (uses existing schema.graphql)
cd ui && yarn codegen
```

### Adding a New Query or Field

1. Add/modify the resolver in the backend (e.g., add a field to `IncomeQueries.cs`)
2. Run `./scripts/export-schema.sh` to update `schema.graphql`
3. Run `cd ui && yarn codegen` to regenerate TypeScript types
4. Write your `.graphql` query file in the feature's `graphql/` directory
5. Run codegen again to generate the operation types

Or simply: `cd ui && yarn schema:update` after step 1.

## Code Generation

### Configuration

Codegen is configured in [`ui/codegen.ts`](../ui/codegen.ts) with two output targets:

**1. Base schema types** -- generated once in core:
```
ui/src/app/core/api/graphql/generated/schema.types.ts
```
Contains all GraphQL types, enums, and input types as TypeScript interfaces.

**2. Operation types** -- generated near each `.graphql` file:
```
ui/src/app/features/{feature}/graphql/*.generated.ts
```
Contains typed query variables, response types, and injectable Angular services.

### Custom Scalar Mappings

| GraphQL Scalar | TypeScript Type |
|----------------|-----------------|
| `DateTime` | `string` (ISO-8601) |
| `Decimal` | `number` |

Note: `Decimal` maps to JS `number` (IEEE 754 float64). Precision beyond ~15 significant digits can be lost; fine for display, but be cautious with client-side arithmetic for large amounts.

### Writing Queries

Place `.graphql` files in `features/{feature}/graphql/`:

```graphql
# features/expenses/graphql/expenses.queries.graphql
query GetExpenses($first: Int, $after: String) {
  expenses(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ...ExpenseFields
    }
    totalCount
  }
}
```

Use fragments for reusable field selections:

```graphql
# features/expenses/graphql/expense.fragment.graphql
fragment ExpenseFields on ExpenseDocument {
  id
  date
  description
  amount
  currency
}
```

After running codegen, you get:
- `GetExpensesQuery` -- response type
- `GetExpensesQueryVariables` -- variables type
- `GetExpensesDocument` -- the gql document constant

## Frontend Service Layers

Three layers between GraphQL and the UI:

```
GraphQLService (core)
       │
       ▼
Feature GraphQL Service (e.g., IncomesGraphQLService)
       │
       ▼
Signal Store
       │
       ▼
Components
```

### 1. Base GraphQL Service

[`graphql.service.ts`](../ui/src/app/core/api/graphql/services/graphql.service.ts) wraps Apollo Client with three methods:

- `query()` -- one-shot fetch (`fetchPolicy: 'network-only'`)
- `watchQuery()` -- reactive query that updates on cache changes
- `mutate()` -- execute a mutation

All use `errorPolicy: 'all'` and throw `GraphQLRequestError` on errors.

### 2. Feature GraphQL Service

Each feature has its own service that:
- Calls the base `GraphQLService` with typed documents
- Builds filter/sort/pagination variables from app state
- Maps GraphQL responses to domain models

Example from [`incomes-graphql.service.ts`](../ui/src/app/features/incomes/services/incomes-graphql.service.ts):

```typescript
getAll(variables?: GetIncomesQueryVariables): Observable<IIncome[]> {
  return this.#graphql
    .query<GetIncomesQuery>(GetIncomesDocument, variables)
    .pipe(map((data) => this.#mapper.mapToIncomes(data.incomes?.nodes ?? [])));
}
```

### 3. Signal Store

The NgRx Signal Store dispatches events that trigger GraphQL calls via effect-like handlers, then updates entities and pagination state.

## Pagination

Uses **Relay-style cursor pagination** end-to-end.

### Backend

Hot Chocolate handles pagination via the `[UsePaging]` attribute:

```csharp
[UsePaging(IncludeTotalCount = true)]
public IExecutable<IncomeDocument> GetIncomes(
    [Service] IMongoCollection<IncomeDocument> collection)
```

This generates the `IncomesConnection` type with `pageInfo`, `edges`, `nodes`, and `totalCount`.

### Frontend

The feature service converts app pagination params to GraphQL variables:

| Direction | GraphQL Variables |
|-----------|-------------------|
| Forward (next) | `first` + `after` (cursor) |
| Backward (previous) | `last` + `before` (cursor) |
| Initial load | `first` only |

## Filtering and Sorting

### Backend

`[UseFiltering]` and `[UseSorting]` on a resolver auto-generate input types from the document model. Hot Chocolate translates these to MongoDB queries via `HotChocolate.Data.MongoDb`.

### Frontend

The feature service builds filter inputs from UI state:

```typescript
// Date range
{ date: { gte: from, lte: to } }

// Text search
{ description: { contains: searchQuery } }

// Category filter
{ categories: { some: { in: selectedCategories } } }

// Combined with AND
{ and: [condition1, condition2, ...] }
```

Sorting maps directly:

```typescript
{ [field]: 'ASC' | 'DESC' }
```

## Error Handling

- Apollo error policy is `'all'` -- collects both errors and partial data
- `GraphQLRequestError` wraps the errors array with a concatenated message
- Feature services let errors propagate to the store layer
- See [`graphql-error.ts`](../ui/src/app/core/api/graphql/types/graphql-error.ts)
