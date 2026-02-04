# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WiSaveUI is a personal finance management application built with Angular 21. It uses zoneless change detection for performance, NgRx Signal Store for state management, PrimeNG for UI components, and Tailwind CSS for styling.

## Architecture Reference

Based on [Scalable Angular App Architecture](https://georgebyte.com/scalable-angular-app-architecture/) by George Byte, modernized for Angular 21 with signals and standalone components.

### Component Types

**Presentational Components** (`components/`):
- Handle only UI rendering and user interaction
- Receive data via signal inputs, emit events via outputs
- No business logic, no state mutations, no API calls
- Highly reusable

**Smart/Container Components** (`containers/`, `views/`):
- Connect stores with presentational components
- Know app state structure and store methods
- `views/` are routable containers that sync route params with store state

### One-Way Data Flow

```
Store → Container → Presentational → UI
         ↑                            |
         └──── events ────────────────┘
```

## Common Commands

```bash
# Development server (http://localhost:4200)
yarn start

# Production build
yarn build

# Run all tests
yarn test

# Lint code
yarn lint

# Lint and auto-fix
yarn lint:fix

# Format code with Prettier
yarn format

# Check formatting without changes
yarn format:check
```

## Architecture

### State Management (NgRx Signal Store)

The app uses NgRx Signal Store (not traditional NgRx) with `@angular-architects/ngrx-toolkit`:

```typescript
signalStore({ providedIn: 'root' },
  withDevtools('StoreName'),
  withGlitchTracking(),
  withState(initialState)
)
```

Stores are located in `features/<feature>/store/`. Access store in components using `inject()`:
```typescript
#store = inject(IncomesStore);
incomes = this.#store.incomes();
```

### Component Patterns

All components are standalone (no NgModules). Key patterns:
- Signal-based inputs: `data = input.required<IIncome[]>()`
- Inject function: `#service = inject(ServiceName)`
- Private fields with `#` prefix for injected dependencies

### Feature Module Structure

```
features/<feature>/
├── components/     # Presentational components
├── containers/     # Smart components (state-connected)
├── store/          # NgRx Signal Store
├── types/          # Interfaces and types
├── views/          # Route-level components
├── services/       # Feature-specific services
├── helpers/        # Utility functions
└── <feature>.routes.ts
```

### Path Aliases

```typescript
@core/*      → src/app/core/*
@features/*  → src/app/features/*
@layout/*    → src/app/layout/*
@shared/*    → src/app/shared/*
@services/*  → src/app/core/services/*
@types/*     → src/app/core/types/*
```

### Routing

Features are lazy-loaded via router:
```typescript
{
  path: 'incomes',
  loadChildren: () => import('./incomes/incomes.routes').then((m) => m.routes),
}
```

## Styling

- **Tailwind CSS** for utility classes
- **PrimeNG** components with `tailwindcss-primeui` plugin
- **Custom theme** in `src/theme.ts` extending Aura preset
- **Design tokens** in `src/styles/colors.css` (HSL-based)
- **Dark mode** via `.dark` class and CSS custom properties

Theme toggle managed by `ThemeService` with localStorage persistence.

## Testing

Uses Vitest (not Karma/Jasmine). Tests follow `*.spec.ts` pattern.

## Linting (ESLint)

ESLint is configured with flat config (`eslint.config.mjs`) and includes:

- **@angular-eslint** - Angular-specific rules
- **@typescript-eslint** - TypeScript rules
- **@rxlint** - RxJS best practices
- **eslint-plugin-boundaries** - Architectural boundary enforcement

### Architectural Boundaries

The boundaries plugin enforces layer separation:

| Layer | Can Import | Cannot Import |
|-------|------------|---------------|
| `core/` | core only | shared, features, layout |
| `shared/` | core, shared | features, layout |
| `layout/` | core, shared, layout | features |
| `feature/components/` | core, shared, types | **store**, other features |
| `feature/containers/` | core, shared, types, components, store | other features |
| `feature/views/` | all feature internals, core, shared | other features |
| `feature/store/` | core, types, services, helpers | components, other features |

**Key rules:**
- Presentational components (`components/`) cannot access store
- Features cannot import from other features
- Cross-feature communication goes through `core/` (shared state/services)

## Key Types

```typescript
interface IMoney {
  amount: number;
  currency: Currency; // PLN, EUR, USD, GBP, CHF
}

interface IIncome {
  id: string;
  date: Date;
  description: string;
  category: string[];
  amount: IMoney;
  recurring?: boolean;
}
```

## Angular 21 Features in Use

- Zoneless change detection (`provideExperimentalZonelessChangeDetection`)
- Signal-based inputs (`input()`, `input.required()`)
- Standalone components (no NgModules)
- `inject()` function for DI

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Component | `feature-name.component.ts` | `incomes-table.component.ts` |
| Service | `feature-name.service.ts` | `incomes.service.ts` |
| Store | `feature-name.store.ts` | `incomes.store.ts` |
| Interface | `feature-name.interface.ts` | `incomes.interface.ts` |
| Type | `feature-name.type.ts` | `incomes.type.ts` |
| Helper | `feature-name.helper.ts` | `currency.helper.ts` |
| Enum | `feature-name.enum.ts` | `currency.enum.ts` |

### Classes & Interfaces

- Components: `FeatureNameComponent`
- Services: `FeatureNameService`
- Stores: `FeatureNameStore`
- Interfaces: `IFeatureName` (prefix with `I`)
- Types: `TFeatureName` (prefix with `T`) or descriptive name
- Enums: `FeatureName` (PascalCase, no prefix)

## Git Workflow

### Branch Naming

```
feature/short-description
fix/short-description
refactor/short-description
chore/short-description
```

### Commit Message Format

```
<type>: <short description>

<optional body>
```

**Types:** `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`

**Examples:**
```
feat: add income filtering by category
fix: resolve currency conversion rounding error
refactor: extract table pagination to shared component
```

## Code Guidelines

### Do

- Use signal inputs: `data = input.required<T>()`
- Use `inject()` for dependency injection
- Use `#` prefix for private injected fields: `#store = inject(Store)`
- Use path aliases for imports: `@features/*`, `@core/*`
- Keep components small and focused (single responsibility)
- Use `output()` for event emitters
- Use `computed()` for derived state
- Use `effect()` sparingly, prefer declarative patterns

### Don't

- Don't use `@Input()` decorator — use signal inputs
- Don't use constructor injection — use `inject()`
- Don't import from other features directly — use `core/` for shared state
- Don't access store from presentational components
- Don't use `OnPush` change detection — app is zoneless
- Don't use `BehaviorSubject` for state — use Signal Store
- Don't mutate state directly — use store methods
- Don't use `ngOnInit` for simple initialization — use `inject()` or field initializers