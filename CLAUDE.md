# WiSave - Claude Context

## Project Overview

WiSave is a modular monolith financial tracking application built with .NET 10, following CQRS and Event Sourcing patterns.

## Repository Structure

```
wisave/
├── src/            # .NET backend (modular monolith)
├── ui/             # Angular frontend (see ui/CLAUDE.md for details)
├── docs/           # Project documentation (see docs/README.md)
├── docker/         # Docker init scripts
├── scripts/        # Schema export & check scripts
├── schema.graphql  # GraphQL schema (exported from Hot Chocolate, do not edit manually)
└── docker-compose.yml
```

## Architecture

### Pattern: Modular Monolith + CQRS + Event Sourcing

```
┌─────────────────────────────────────────────────────────────────┐
│                         WRITE SIDE                               │
│  Command → Handler → Aggregate → Domain Events → EventStoreDB   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         READ SIDE                                │
│  MassTransit Consumer → Projection Handler → MongoDB            │
│  GraphQL Query ← MongoDB                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── Bootstrappers/WiSave.Bootstrapper/    # Composition root, host
├── Modules/
│   ├── {ModuleName}/
│   │   └── WiSave.Modules.{Name}.Core/
│   │       ├── Api/                      # GraphQL mutations/queries
│   │       ├── Application/              # Commands, Queries, Handlers
│   │       ├── Domain/                   # Aggregates, Entities, Events
│   │       ├── Infrastructure/           # Repositories, Services
│   │       └── Projections/              # MongoDB read models
│   └── GeneralPurpose/                   # Cross-module REST API (SQL-based)
├── Shared/
│   ├── WiSave.Shared.Abstractions/       # Interfaces, contracts
│   └── WiSave.Shared.Infrastructure/     # Cross-cutting implementations
└── External/                             # External service integrations
```


## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | .NET 10 |
| Event Store | EventStoreDB (Kurrent) |
| Read Models | MongoDB |
| Messaging | MassTransit (RabbitMQ/Kafka) |
| GraphQL | Hot Chocolate |
| REST API | ASP.NET Core Controllers |
| SQL Database | PostgreSQL + EF Core |

## Key Patterns

### Event Sourcing
- Aggregates extend `AggregateRoot`
- Domain events stored in EventStoreDB
- Events replayed to rebuild aggregate state

### Projections (Read Models)
- MongoDB collections prefixed by module name (e.g., `Users_List`)
- `IModuleMongoContext` enforces module isolation
- Projection handlers update read models on domain events

### CQRS
- Commands: modify state via aggregates
- Queries: read from MongoDB projections (GraphQL) or PostgreSQL (REST)

## Shared Packages

### WiSave.Shared.Abstractions
Pure interfaces, minimal dependencies:
- `Domain/`: AggregateRoot, Entity, ValueObject, IDomainEvent
- `Commands/`: ICommand, ICommandHandler
- `Queries/`: IQuery, IQueryHandler
- `Events/`: IIntegrationEvent
- `EventSourcing/`: IEventStore, IEventSerializer
- `Projections/`: IModuleMongoContext, IProjectionHandler
- `Modules/`: IModule

### WiSave.Shared.Infrastructure
Implementations with NuGet dependencies:
- EventStoreDB repository
- MongoDB context and conventions
- MassTransit configuration
- Hot Chocolate GraphQL setup

## Conventions

### Naming
- Aggregates: `{Name}Aggregate` (e.g., `UserAggregate`)
- Domain Events: `{Entity}{Action}` (e.g., `UserCreated`, `UserNameUpdated`)
- Projection Documents: `{Name}{View}Document` (e.g., `UserListDocument`, `UserDetailsDocument`)
- MongoDB Collections: `{ModuleName}_{CollectionName}` (e.g., `Users_List`)

### Module Structure
Each domain module contains:
- Single `.Core` project with folder-based layers
- Own GraphQL types extending root Query/Mutation
- Own MongoDB collections (isolated by prefix)
- Own domain events and projections

### API Separation
- **GraphQL** (`/graphql`): Event-driven projections from MongoDB
- **REST** (`/api/*`): Cross-module queries from PostgreSQL

## Docker Services

```bash
docker compose up -d
```

| Service | Port | Purpose |
|---------|------|---------|
| wisave-api | 5100 | .NET Application |
| mongodb | 27017 | Read model storage |
| mongo-express | 8082 | MongoDB UI |

## Common Commands

```bash
# Backend - run locally
dotnet run --project src/Bootstrappers/WiSave.Bootstrapper

# Frontend - dev server (http://localhost:4200)
cd ui && yarn start

# Frontend - build
cd ui && yarn build

# Docker
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose logs -f        # View logs

# Database
mongosh "mongodb://wisave:wisave_secret@localhost:27017/wisave?authSource=admin"

# GraphQL schema workflow
./scripts/export-schema.sh    # Export schema from Hot Chocolate → schema.graphql + ui/schema.graphql
./scripts/check-schema.sh     # Diff check (CI: fails if schema.graphql is stale)
cd ui && yarn schema:update   # Export schema + run codegen in one step
cd ui && yarn codegen         # Run codegen only (uses existing schema.graphql)
```

## GraphQL Schema Workflow

The Hot Chocolate runtime schema is the **canonical source**. The `schema.graphql` file at the repo root is an export — never edit it manually.

1. Modify resolvers/types in the .NET backend
2. Run `./scripts/export-schema.sh` (or `cd ui && yarn schema:update`)
3. This exports `schema.graphql` to repo root and copies to `ui/` for codegen
4. Frontend codegen reads `ui/schema.graphql` to generate TypeScript types
5. CI runs `./scripts/check-schema.sh` to ensure `schema.graphql` matches the server

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ConnectionStrings__MongoDB` | MongoDB connection string |
| `ConnectionStrings__EventStore` | EventStoreDB connection string |
| `ConnectionStrings__PostgreSQL` | PostgreSQL connection string |
| `Messaging__Broker` | `InMemory`, `RabbitMQ`, or `Kafka` |

## Important Notes

- All modules share single MongoDB server but are isolated by collection prefix
- EventStoreDB is source of truth for domain state
- MongoDB projections are eventually consistent
- Cross-module communication via integration events (MassTransit)
- No direct database access between modules
