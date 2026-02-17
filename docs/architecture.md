# Architecture

## Overview

WiSave follows a **Modular Monolith** architecture with **CQRS** (Command Query Responsibility Segregation) and **Event Sourcing**. The system separates write and read concerns into distinct paths.

## Data Flow

```
                            WRITE SIDE
┌──────────────────────────────────────────────────────────┐
│  HTTP Request                                            │
│       │                                                  │
│       ▼                                                  │
│  Command ──► Handler ──► Aggregate ──► Domain Events     │
│                                            │             │
│                                            ▼             │
│                                       EventStoreDB       │
└──────────────────────────────────────────────────────────┘
                              │
                    Domain Events published
                       via MassTransit
                              │
                              ▼
                            READ SIDE
┌──────────────────────────────────────────────────────────┐
│  Consumer ──► Projection Handler ──► MongoDB             │
│                                        │                 │
│                                        ▼                 │
│                              GraphQL Query resolves      │
│                              from MongoDB projection     │
│                                        │                 │
│                                        ▼                 │
│                                  Angular Frontend        │
└──────────────────────────────────────────────────────────┘
```

**Write side:** Commands modify state through aggregates. Domain events are stored in EventStoreDB as the source of truth.

**Read side:** Domain events are consumed by projection handlers that update MongoDB read models. GraphQL queries serve data from these projections.

## Modular Monolith

Each feature area (Incomes, Users, etc.) is an isolated module that runs in the same process but maintains strict boundaries.

### Module Isolation Rules

- Modules cannot reference each other directly
- Each module owns its MongoDB collections (prefixed: `Incomes_Items`, `Users_List`)
- Cross-module communication happens through integration events via MassTransit
- Each module registers its own GraphQL types, services, and projections

### Module Discovery

Modules are discovered automatically at startup:

1. `ModuleLoader` scans for `WiSave.Modules.*.dll` assemblies
2. Finds all classes implementing `IModule`
3. Calls `Register()` to wire up DI, `GetGraphQlTypeExtensions()` to register GraphQL types
4. The shared infrastructure (`AddModularGraphQl`) collects all type extensions into a single GraphQL schema

See [`ModuleLoader.cs`](../src/Shared/WiSave.Shared.Infrastructure/Modules/ModuleLoader.cs) and [`IModule.cs`](../src/Shared/WiSave.Shared.Abstractions/Modules/IModule.cs).

## CQRS

Commands and queries use separate models and paths:

| Concern | Path | Storage | API |
|---------|------|---------|-----|
| Commands (writes) | Aggregate -> EventStoreDB | EventStoreDB | GraphQL mutations |
| Queries (reads) | MongoDB projections | MongoDB | GraphQL queries |
| Cross-module queries | PostgreSQL + EF Core | PostgreSQL | REST API |

## Event Sourcing

- Aggregates extend `AggregateRoot` and produce domain events
- Events are appended to EventStoreDB streams (never updated or deleted)
- Aggregate state is rebuilt by replaying events
- Projections subscribe to events and maintain denormalized read models in MongoDB

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | .NET 10 |
| Event Store | EventStoreDB (Kurrent) |
| Read Models | MongoDB |
| Messaging | MassTransit (RabbitMQ/Kafka) |
| GraphQL | Hot Chocolate v15 |
| REST API | ASP.NET Core Controllers |
| SQL Database | PostgreSQL + EF Core |
| Frontend | Angular 21, NgRx Signal Store, PrimeNG, Tailwind CSS |

## Project Structure

```
src/
├── Bootstrappers/WiSave.Bootstrapper/    # Composition root, host
├── Modules/
│   ├── {ModuleName}/
│   │   ├── WiSave.Modules.{Name}.Api/          # Module entry point, IModule impl
│   │   └── WiSave.Modules.{Name}.Projections/  # Read models, GraphQL, MongoDB
│   └── GeneralPurpose/                          # Cross-module REST API (SQL-based)
├── Shared/
│   ├── WiSave.Shared.Abstractions/       # Interfaces, contracts (no dependencies)
│   └── WiSave.Shared.Infrastructure/     # MongoDB, GraphQL, MassTransit setup
└── External/                             # External service integrations

ui/
├── src/app/
│   ├── core/          # Singleton services, API clients, GraphQL setup
│   ├── shared/        # Reusable components, types, utilities
│   ├── features/      # Feature modules (incomes, etc.)
│   │   └── <feature>/
│   │       └── +store/    # NgRx Signal Store (events, reducers, state, event handlers)
│   └── layout/        # App shell, navigation
└── schema.graphql     # Local copy for codegen (generated, gitignored)
```

## API Separation

- **GraphQL** (`/graphql`): Serves event-sourced projections from MongoDB. Used by the Angular frontend.
- **REST** (`/api/*`): Serves cross-module queries from PostgreSQL via EF Core.
