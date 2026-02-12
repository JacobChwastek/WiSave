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
