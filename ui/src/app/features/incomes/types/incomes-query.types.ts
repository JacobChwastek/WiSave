import { type ICursorPaginationParams, type IPageInfo } from '@shared/types';

import type { IIncomesFilter, IIncomesSortOrder } from './incomes-state.types';
import type { IIncome } from './incomes.interfaces';

export interface IIncomesQueryResult {
  incomes: IIncome[];
  totalCount: number;
  pageInfo: IPageInfo;
}

export interface IIncomesQueryParams extends ICursorPaginationParams {
  filter?: IIncomesFilter;
  sort?: IIncomesSortOrder;
}
