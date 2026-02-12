import { initialPagination, type IPagination, type IStoreError } from '@shared/types';

import { type IIncomesFilter, type IIncomesSortOrder } from '../../types/incomes-state.types';

export interface IncomesState {
  isLoading: boolean;
  error: IStoreError | null;
  filter: IIncomesFilter;
  sort: IIncomesSortOrder;
  pagination: IPagination;
  availableCategories: string[];
  categoriesLoading: boolean;
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
};
