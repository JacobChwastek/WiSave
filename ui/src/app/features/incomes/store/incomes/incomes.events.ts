import { type IIncome, type IncomeId } from '@features/incomes/types/incomes.interfaces';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

import { type CursorDirection, type IPageInfo, type IStoreError } from '@shared/types';

import { type IIncomeMonthlyStats, type IIncomeStats, type IncomeStatsScope, type IIncomesFilter, type IIncomesSortOrder, type MonthlyStatsScale } from '../../types/incomes-state.types';

// UI/Component events - commands from user interactions
export const incomesPageEvents = eventGroup({
  source: 'Incomes Page',
  events: {
    opened: type<void>(),
    navigatePage: type<{ direction: CursorDirection; cursor: string | null; pageSize: number }>(),
    pageSizeChanged: type<{ rows: number }>(),
    add: type<{ income: Omit<IIncome, 'id'> }>(),
    update: type<{ id: IncomeId; changes: Partial<IIncome> }>(),
    remove: type<{ id: IncomeId }>(),
    filterApplied: type<{ filter: Partial<IIncomesFilter> }>(),
    filtersCleared: type<void>(),
    sortChanged: type<{ sort: IIncomesSortOrder }>(),
    statsScopeChanged: type<{ scope: IncomeStatsScope }>(),
    monthlyStatsNavigate: type<{ direction: 'back' | 'forward' }>(),
    monthlyStatsScaleChanged: type<{ scale: MonthlyStatsScale }>(),
    fetchById: type<{ id: IncomeId }>(),
  },
});

// API response events - results from async operations
export const incomesApiEvents = eventGroup({
  source: 'Incomes API',
  events: {
    loadedSuccess: type<{ incomes: IIncome[]; totalCount: number; pageInfo: IPageInfo; error: IStoreError | null }>(),
    loadedFailure: type<{ error: IStoreError }>(),
    addedSuccess: type<{ income: IIncome }>(),
    addedFailure: type<{ error: IStoreError }>(),
    updatedSuccess: type<{ income: IIncome }>(),
    updatedFailure: type<{ id: IncomeId; error: IStoreError }>(),
    removedSuccess: type<{ id: IncomeId }>(),
    removedFailure: type<{ id: IncomeId; error: IStoreError }>(),
    categoriesLoadedSuccess: type<{ categories: string[] }>(),
    categoriesLoadedFailure: type<{ error: IStoreError }>(),
    statsLoadedSuccess: type<{ stats: IIncomeStats }>(),
    statsLoadedFailure: type<{ error: IStoreError }>(),
    monthlyStatsLoadedSuccess: type<{ stats: IIncomeMonthlyStats[] }>(),
    monthlyStatsLoadedFailure: type<{ error: IStoreError }>(),
    fetchByIdSuccess: type<{ income: IIncome }>(),
    fetchByIdFailure: type<{ error: IStoreError }>(),
  },
});
