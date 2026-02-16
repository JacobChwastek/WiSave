import { type IStoreError } from '@shared/types';

import { type IIncomeMonthlyStats, type IIncomeStats, type IncomeStatsScope } from '../../types/incomes-state.types';

export interface IncomesStatsState {
  error: IStoreError | null;
  stats: IIncomeStats | null;
  statsLoading: boolean;
  statsScope: IncomeStatsScope;
  monthlyStats: IIncomeMonthlyStats[];
  monthlyStatsLoading: boolean;
  monthlyStatsYear: number;
}

export const initialStatsState: IncomesStatsState = {
  error: null,
  stats: null,
  statsLoading: false,
  statsScope: 'recurring',
  monthlyStats: [],
  monthlyStatsLoading: false,
  monthlyStatsYear: new Date().getFullYear(),
};
