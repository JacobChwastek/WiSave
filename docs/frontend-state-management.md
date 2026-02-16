# Frontend State Management

## NgRx Signal Store

The Angular frontend uses [NgRx Signal Store](https://ngrx.io/guide/signals) with `@angular-architects/ngrx-toolkit` for state management and `@ngrx/signals/events` for event-driven side effects.

## Store Directory Convention (`+store/`)

Store files live in `features/<feature>/+store/`. The `+` prefix signals that the directory is a **framework integration layer** (inspired by SvelteKit/Analog conventions) — it contains store definitions, events, reducers, state, and event handlers, but no UI components.

A `+store/` directory may contain sub-stores for different concerns:

```
features/incomes/+store/
├── incomes/
│   ├── incomes.store.ts              # Main store (signalStore)
│   ├── incomes.state.ts              # State interface & initial values
│   ├── incomes.events.ts             # Page & API events
│   └── incomes.event-handlers.ts     # Side effects (API calls)
└── stats/
    ├── incomes-stats.store.ts
    ├── incomes-stats.state.ts
    └── incomes-stats.event-handlers.ts
```

## Event Handlers

Event handlers use `withEventHandlers` from `@ngrx/signals/events` to react to dispatched events with observable streams.

### Typing Event Handlers

Use `signalStoreFeature` input constraints and `withProps` to get a fully typed store parameter:

```typescript
import { signalStoreFeature, type } from '@ngrx/signals';
import { withProps } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';

export function withFeatureEventHandlers() {
  return signalStoreFeature(
    // Declare required state from preceding features
    { state: type<Pick<FeatureState, 'filter' | 'sort'>>() },
    // Inject dependencies as typed props
    withProps(() => ({
      _events: inject(Events),
      _api: inject(FeatureApiService),
    })),
    // store is fully typed — no `any` needed
    withEventHandlers((store) => ({
      load$: store._events.on(pageEvents.opened).pipe(
        exhaustMap(() => store._api.load(store.filter())),
      ),
    })),
  );
}
```

**Key points:**
- `{ state: type<Pick<...>>() }` tells TypeScript what state must exist before this feature is applied
- `withProps` makes injected services available as typed properties on the store
- The `_` prefix convention marks props as internal (not part of the public store API)

### RxJS Flattening Operators

Choose the flattening operator based on the handler's intent:

| Operator | Behavior | Use When |
|----------|----------|----------|
| `exhaustMap` | Ignores new emissions while a request is in-flight | **Load triggers** — prevent duplicate API calls (e.g., page opened, select by ID) |
| `switchMap` | Cancels the in-flight request, starts a new one | **Parameter changes** — always want the latest result (e.g., filter, sort, pagination changes) |
| `concatMap` | Queues emissions, processes sequentially | **Ordered mutations** — each must complete before the next (e.g., sequential saves) |
| `mergeMap` | Processes all emissions concurrently | **Independent mutations** — order doesn't matter (rare in UI) |

### Decision Guide

```
Is a duplicate trigger harmful?
├── Yes → exhaustMap (page open, fetch by ID)
└── No
    └── Should old requests be cancelled?
        ├── Yes → switchMap (filter, sort, page navigation)
        └── No
            └── Must operations run in order?
                ├── Yes → concatMap
                └── No  → mergeMap
```

### Examples

```typescript
// exhaustMap: page opened — ignore duplicate opens while loading
load$: store._events.on(pageEvents.opened).pipe(
  exhaustMap(() => api.loadAll()),
),

// switchMap: filter changed — cancel old request, fetch with new filter
filterChanged$: store._events.on(pageEvents.filterApplied).pipe(
  switchMap(({ payload }) => api.loadFiltered(payload.filter)),
),
```
