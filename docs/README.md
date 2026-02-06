# WiSave Documentation

WiSave is a modular monolith financial tracking application built with .NET 10 and Angular 21.

## Contents

- [Architecture](architecture.md) -- CQRS, Event Sourcing, modular monolith patterns, data flow
- [Module Development Guide](module-development.md) -- step-by-step guide to adding a new module
- [GraphQL Workflow](graphql-workflow.md) -- schema management, codegen, frontend integration

## Quick Reference

```bash
# Backend
dotnet run --project src/Bootstrappers/WiSave.Bootstrapper

# Frontend (http://localhost:4200)
cd ui && yarn start

# Docker services
docker compose up -d

# GraphQL schema + codegen
cd ui && yarn schema:update
```

See [CLAUDE.md](../CLAUDE.md) and [ui/CLAUDE.md](../ui/CLAUDE.md) for full command reference and coding conventions.
