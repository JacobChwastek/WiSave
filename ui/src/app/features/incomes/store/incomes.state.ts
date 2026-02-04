import { initialPagination, type IPagination } from '@shared/types';

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
  total: number;
}

export type IncomeStatsScope = 'recurring' | 'all';

export interface IncomesState {
  isLoading: boolean;
  error: string | null;
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
}

export const initialFilter: IIncomesFilter = {
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
};
