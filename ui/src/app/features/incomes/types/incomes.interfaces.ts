import { IMoney } from '@core/types';

export interface IIncome {
  id: string;
  date: Date;
  description: string;
  category: string[];
  amount: IMoney;
  recurring?: boolean;
}
