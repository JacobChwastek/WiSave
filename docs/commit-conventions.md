# Commit Conventions

We follow **Conventional Commits** with a DDD‑friendly scope to keep history clear across frontend and backend.

## Format

```
<type>(<scope>): <subject>
```

- **type**: what kind of change this is
- **scope**: bounded context or layer
- **subject**: short, imperative, no period

## Allowed Types

- `feat`: new user‑visible functionality
- `fix`: bug fix
- `refactor`: code change that isn’t a feature or fix
- `perf`: performance improvement
- `docs`: documentation only
- `style`: formatting, linting, or non‑functional style changes
- `test`: add/adjust tests
- `build`: build system or dependencies
- `ci`: CI/CD changes
- `chore`: maintenance tasks
- `revert`: revert a previous commit

## Scope Guidelines (DDD)

Pick the **bounded context** first. If unclear, use a **layer**.

Examples of scopes:
- `incomes`, `budgets`, `auth`, `graphql`, `reports`
- `ui`, `api`, `infra`, `db`, `shared`

## Breaking Changes

Use `!` after the type/scope and add a footer:

```
feat(incomes)!: rename recurring fields

BREAKING CHANGE: update API and UI to use recurringAmount
```

## Examples

- `feat(incomes): add recurring income editing`
- `fix(graphql): handle null categories`
- `refactor(ui): move dialog wrapper to shared`
- `docs(architecture): add event flow diagram`

## Quick Checklist

- Use imperative mood: “add”, “fix”, “refactor”
- Keep under ~72 characters when possible
- Use the most specific scope you can
- Add `!` + footer for breaking changes
