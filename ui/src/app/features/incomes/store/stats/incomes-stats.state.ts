import { type IStoreError } from '@shared/types';

import { type IIncomeMonthlyStats, type IIncomeStats, type IncomeStatsScope, type MonthlyStatsScale } from '../../types/incomes-state.types';

export interface IncomesStatsState {
  error: IStoreError | null;
  stats: IIncomeStats | null;
  statsLoading: boolean;
  statsScope: IncomeStatsScope;
  monthlyStats: IIncomeMonthlyStats[];
  monthlyStatsLoading: boolean;
  monthlyStatsOffset: number;
  monthlyStatsHasMore: boolean;
  monthlyStatsScale: MonthlyStatsScale;
}

export const initialStatsState: IncomesStatsState = {
  error: null,
  stats: null,
  statsLoading: false,
  statsScope: 'recurring',
  monthlyStats: [],
  monthlyStatsLoading: false,
  monthlyStatsOffset: 0,
  monthlyStatsHasMore: true,
  monthlyStatsScale: 'quarter',
};
