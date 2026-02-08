import { initialPagination, type IPagination, type IStoreError } from '@shared/types';

export interface IDateRangeFilter {
  from: Date | null;
  to: Date | null;
}

export interface IIncomesFilter {
  dateRange: IDateRangeFilter;
  searchQuery: string;
  categories: string[];
  recurring: boolean | null;
}

export interface IIncomesSortOrder {
  field: 'date' | 'amount' | 'description' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface IIncomeStats {
  yearRecurringTotal: number;
  lastMonthRecurringTotal: number;
  lastMonthRecurringChangePct: number | null;
  thisMonthRecurringTotal: number;
  thisMonthRecurringChangePct: number | null;
  last3MonthsRecurringAverage: number;
}

export interface IIncomeMonthlyStats {
  year: number;
  month: number;
  recurringTotal: number;
  nonRecurringTotal: number;
}

export type IncomeStatsScope = 'recurring' | 'all';

export type MonthlyStatsScale = 'quarter' | 'half' | 'year';

export const MONTHLY_STATS_SCALE_SIZES: Record<MonthlyStatsScale, number> = {
  quarter: 3,
  half: 6,
  year: 12,
};

export interface IncomesState {
  isLoading: boolean;
  error: IStoreError | null;
  filter: IIncomesFilter;
  sort: IIncomesSortOrder;
  pagination: IPagination;
  availableCategories: string[];
  categoriesLoading: boolean;
  stats: IIncomeStats | null;
  statsLoading: boolean;
  statsScope: IncomeStatsScope;
  monthlyStats: IIncomeMonthlyStats[];
  monthlyStatsLoading: boolean;
  monthlyStatsOffset: number;
  monthlyStatsHasMore: boolean;
  monthlyStatsScale: MonthlyStatsScale;
}

export function createInitialFilter(): IIncomesFilter {
  const now = new Date();
  return {
    dateRange: {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now,
    },
    searchQuery: '',
    categories: [],
    recurring: null,
  };
}

export const initialFilter: IIncomesFilter = createInitialFilter();

export const emptyFilter: IIncomesFilter = {
  dateRange: { from: null, to: null },
  searchQuery: '',
  categories: [],
  recurring: null,
};

export const initialSort: IIncomesSortOrder = {
  field: 'date',
  direction: 'desc',
};

export const initialState: IncomesState = {
  isLoading: false,
  error: null,
  filter: initialFilter,
  sort: initialSort,
  pagination: initialPagination,
  availableCategories: [],
  categoriesLoading: false,
  stats: null,
  statsLoading: false,
  statsScope: 'recurring',
  monthlyStats: [],
  monthlyStatsLoading: false,
  monthlyStatsOffset: 0,
  monthlyStatsHasMore: true,
  monthlyStatsScale: 'quarter',
};
