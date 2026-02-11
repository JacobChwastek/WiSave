import { withDevtools, withGlitchTracking, withTrackedReducer } from '@angular-architects/ngrx-toolkit';
import { type IIncome } from '@features/incomes/types/incomes.interfaces';
import { signalStore, withState } from '@ngrx/signals';
import { addEntity, removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { on } from '@ngrx/signals/events';

import { withIncomesEventHandlers } from './incomes.event-handlers';
import { incomesApiEvents, incomesPageEvents } from './incomes.events';
import { emptyFilter, initialState } from './incomes.state';

export const IncomesStore = signalStore(
  { providedIn: 'root' },
  withDevtools('Incomes', withGlitchTracking()),
  withState(initialState),
  withEntities<IIncome>(),
  withTrackedReducer(
    on(incomesPageEvents.opened, () => ({ isLoading: true, error: null, statsLoading: true, monthlyStatsLoading: true })),
    on(incomesPageEvents.navigatePage, ({ payload }, state) => {
      const currentPage = state.pagination.currentPage;
      const newPage = payload.direction === 'next' ? currentPage + 1 : payload.direction === 'previous' ? Math.max(1, currentPage - 1) : 1;

      return {
        isLoading: true,
        error: null,
        pagination: {
          ...state.pagination,
          pendingPage: newPage,
        },
      };
    }),
    on(incomesPageEvents.pageSizeChanged, ({ payload }, state) => ({
      isLoading: true,
      error: null,
      pagination: {
        ...state.pagination,
        pendingPage: null,
        rows: payload.rows,
        currentPage: 1,
      },
    })),
    on(incomesPageEvents.add, () => ({ isLoading: true, error: null })),
    on(incomesPageEvents.update, () => ({ isLoading: true, error: null })),
    on(incomesPageEvents.remove, () => ({ isLoading: true, error: null })),
    on(incomesPageEvents.filterApplied, ({ payload }, state) => ({
      isLoading: true,
      error: null,
      filter: {
        ...state.filter,
        ...payload.filter,
      },
      pagination: {
        ...state.pagination,
        pendingPage: null,
        currentPage: 1,
      },
    })),
    on(incomesPageEvents.filtersCleared, (_, state) => ({
      isLoading: true,
      error: null,
      filter: emptyFilter,
      pagination: {
        ...state.pagination,
        pendingPage: null,
        currentPage: 1,
      },
    })),
    on(incomesPageEvents.sortChanged, ({ payload }, state) => ({
      isLoading: true,
      error: null,
      sort: payload.sort,
      pagination: {
        ...state.pagination,
        pendingPage: null,
        currentPage: 1,
      },
    })),
    on(incomesPageEvents.statsScopeChanged, ({ payload }) => ({ statsScope: payload.scope, statsLoading: true })),
    on(incomesPageEvents.monthlyStatsNavigate, ({ payload }, state) => ({
      monthlyStatsLoading: true,
      monthlyStatsOffset: payload.direction === 'back' ? state.monthlyStatsOffset + 1 : Math.max(0, state.monthlyStatsOffset - 1),
    })),
    on(incomesPageEvents.monthlyStatsScaleChanged, ({ payload }) => ({
      monthlyStatsLoading: true,
      monthlyStatsScale: payload.scale,
      monthlyStatsOffset: 0,
    })),

    on(incomesApiEvents.loadedSuccess, ({ payload }, state) => [
      setAllEntities<IIncome>(payload.incomes),
      () => ({
        isLoading: false,
        error: payload.error,
        pagination: {
          ...state.pagination,
          // Commit pendingPage from pre-reduction state, then clear it.
          pendingPage: null,
          currentPage: state.pagination.pendingPage ?? state.pagination.currentPage,
          totalRecords: payload.totalCount,
          pageInfo: payload.pageInfo,
        },
      }),
    ]),
    on(incomesApiEvents.addedSuccess, ({ payload }) => [addEntity<IIncome>(payload.income), () => ({ isLoading: false, error: null })]),
    on(incomesApiEvents.updatedSuccess, ({ payload }) => [
      updateEntity<IIncome>({ id: payload.income.id, changes: payload.income }),
      () => ({ isLoading: false, error: null }),
    ]),
    on(incomesApiEvents.removedSuccess, ({ payload }) => [removeEntity(payload.id), () => ({ isLoading: false, error: null })]),

    on(incomesApiEvents.loadedFailure, ({ payload }, state) => ({
      isLoading: false,
      error: payload.error,
      pagination: {
        ...state.pagination,
        pendingPage: null,
      },
    })),
    on(incomesApiEvents.addedFailure, ({ payload }) => ({
      isLoading: false,
      error: payload.error,
    })),
    on(incomesApiEvents.updatedFailure, ({ payload }) => ({
      isLoading: false,
      error: payload.error,
    })),
    on(incomesApiEvents.removedFailure, ({ payload }) => ({
      isLoading: false,
      error: payload.error,
    })),

    // Categories
    on(incomesApiEvents.categoriesLoadedSuccess, ({ payload }) => ({
      availableCategories: payload.categories,
      categoriesLoading: false,
    })),
    on(incomesApiEvents.categoriesLoadedFailure, ({ payload }) => ({
      categoriesLoading: false,
      error: payload.error,
    })),

    // Stats
    on(incomesApiEvents.statsLoadedSuccess, ({ payload }) => ({
      stats: payload.stats,
      statsLoading: false,
    })),
    on(incomesApiEvents.statsLoadedFailure, ({ payload }) => ({
      statsLoading: false,
      error: payload.error,
    })),

    // Monthly stats
    on(incomesApiEvents.monthlyStatsLoadedSuccess, ({ payload }) => ({
      monthlyStats: payload.stats,
      monthlyStatsLoading: false,
      monthlyStatsHasMore: payload.stats.length > 0,
    })),
    on(incomesApiEvents.monthlyStatsLoadedFailure, ({ payload }) => ({
      monthlyStatsLoading: false,
      error: payload.error,
    })),
  ),
  withIncomesEventHandlers(),
);
