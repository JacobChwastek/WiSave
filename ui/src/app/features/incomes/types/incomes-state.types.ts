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
  lastYearTotal: number;
  thisYearTotal: number;
  thisMonthTotal: number;
  last3MonthsAverage: number;
  lastYearMonthlyAverage: number;
}

export interface IIncomeMonthlyStats {
  year: number;
  month: number;
  recurringTotal: number;
  nonRecurringTotal: number;
}

export type IncomeStatsScope = 'recurring' | 'all';
