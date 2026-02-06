import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GraphQLService } from '@graphql/services/graphql.service';

import { ICursorPaginationParams } from '@shared/types';

import {
  GetCategoriesDocument,
  GetIncomeByIdDocument,
  GetIncomeMonthlyStatsDocument,
  GetIncomesDocument,
  GetIncomeStatsDocument,
  GetTotalAmountDocument,
  type GetCategoriesQuery,
  type GetIncomeByIdQuery,
  type GetIncomeByIdQueryVariables,
  type GetIncomeMonthlyStatsQuery,
  type GetIncomeMonthlyStatsQueryVariables,
  type GetIncomesQuery,
  type GetIncomesQueryVariables,
  type GetIncomeStatsQuery,
  type GetIncomeStatsQueryVariables,
  type GetTotalAmountQuery,
  type GetTotalAmountQueryVariables,
} from '../graphql/incomes.queries.generated';
import { IIncomeMonthlyStats, IIncomesFilter, IIncomesSortOrder, IIncomeStats } from '../store/incomes.state';
import type { IIncome } from '../types/incomes.interfaces';
import { IncomesMapperService } from './incomes-mapper.service';

export interface IIncomesQueryResult {
  incomes: IIncome[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

export interface IIncomesQueryParams extends ICursorPaginationParams {
  filter?: IIncomesFilter;
  sort?: IIncomesSortOrder;
}

@Injectable({ providedIn: 'root' })
export class IncomesGraphQLService {
  #graphql = inject(GraphQLService);
  #mapper = inject(IncomesMapperService);

  getAll(variables?: GetIncomesQueryVariables): Observable<IIncome[]> {
    return this.#graphql.query<GetIncomesQuery, GetIncomesQueryVariables>(GetIncomesDocument, variables).pipe(
      map((data) => {
        const nodes = data.incomes?.nodes ?? [];
        return this.#mapper.mapToIncomes(nodes);
      }),
    );
  }

  getAllWithPagination(params: IIncomesQueryParams): Observable<IIncomesQueryResult> {
    const variables = this.#buildQueryVariables(params);

    return this.#graphql.query<GetIncomesQuery, GetIncomesQueryVariables>(GetIncomesDocument, variables).pipe(
      map((data) => {
        const nodes = data.incomes?.nodes ?? [];
        return {
          incomes: this.#mapper.mapToIncomes(nodes),
          totalCount: data.incomes?.totalCount ?? 0,
          pageInfo: {
            hasNextPage: data.incomes?.pageInfo.hasNextPage ?? false,
            hasPreviousPage: data.incomes?.pageInfo.hasPreviousPage ?? false,
            startCursor: data.incomes?.pageInfo.startCursor ?? null,
            endCursor: data.incomes?.pageInfo.endCursor ?? null,
          },
        };
      }),
    );
  }

  #buildQueryVariables(params: IIncomesQueryParams): GetIncomesQueryVariables {
    const { direction, cursor, pageSize, filter, sort } = params;

    const variables: GetIncomesQueryVariables = {};

    // Pagination
    if (direction === 'previous' && cursor) {
      variables.last = pageSize;
      variables.before = cursor;
    } else if (direction === 'next' && cursor) {
      variables.first = pageSize;
      variables.after = cursor;
    } else {
      variables.first = pageSize;
    }

    if (filter) {
      variables.where = this.#buildFilterInput(filter);
    }
    if (sort) {
      variables.order = [{ [sort.field]: sort.direction.toUpperCase() as 'ASC' | 'DESC' }];
    }

    return variables;
  }

  #buildFilterInput(filter: IIncomesFilter): GetIncomesQueryVariables['where'] {
    const where: NonNullable<GetIncomesQueryVariables['where']> = {};
    const conditions: NonNullable<GetIncomesQueryVariables['where']>[] = [];

    if (filter.dateRange.from || filter.dateRange.to) {
      const dateFilter: { gte?: string; lte?: string } = {};
      if (filter.dateRange.from) {
        dateFilter.gte = filter.dateRange.from.toISOString();
      }
      if (filter.dateRange.to) {
        dateFilter.lte = filter.dateRange.to.toISOString();
      }
      conditions.push({ date: dateFilter });
    }

    if (filter.searchQuery?.trim()) {
      conditions.push({ description: { contains: filter.searchQuery.trim() } });
    }

    if (filter.categories.length > 0) {
      conditions.push({ categories: { some: { in: filter.categories } } });
    }

    if (filter.recurring !== null) {
      conditions.push({ recurring: { eq: filter.recurring } });
    }

    if (conditions.length > 0) {
      where.and = conditions;
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }

  getById(id: string): Observable<IIncome | null> {
    return this.#graphql
      .query<GetIncomeByIdQuery, GetIncomeByIdQueryVariables>(GetIncomeByIdDocument, { id })
      .pipe(map((data) => (data.incomeById ? this.#mapper.mapToIncome(data.incomeById) : null)));
  }

  getTotalAmount(currency?: string): Observable<number> {
    return this.#graphql.query<GetTotalAmountQuery, GetTotalAmountQueryVariables>(GetTotalAmountDocument, { currency }).pipe(map((data) => data.totalAmount));
  }

  getCategories(): Observable<string[]> {
    return this.#graphql.query<GetCategoriesQuery, Record<string, never>>(GetCategoriesDocument).pipe(map((data) => data.categories));
  }

  getIncomeStats(includeNonRecurring = false): Observable<IIncomeStats> {
    return this.#graphql.query<GetIncomeStatsQuery, GetIncomeStatsQueryVariables>(GetIncomeStatsDocument, { includeNonRecurring }).pipe(
      map((data) => ({
        yearRecurringTotal: data.incomeStats.yearRecurringTotal,
        lastMonthRecurringTotal: data.incomeStats.lastMonthRecurringTotal,
        lastMonthRecurringChangePct: data.incomeStats.lastMonthRecurringChangePct ?? null,
        thisMonthRecurringTotal: data.incomeStats.thisMonthRecurringTotal,
        thisMonthRecurringChangePct: data.incomeStats.thisMonthRecurringChangePct ?? null,
        last3MonthsRecurringAverage: data.incomeStats.last3MonthsRecurringAverage,
      })),
    );
  }

  getIncomeMonthlyStats(monthsBack = 5, offset = 0): Observable<IIncomeMonthlyStats[]> {
    const skipMonths = offset * monthsBack;
    return this.#graphql.query<GetIncomeMonthlyStatsQuery, GetIncomeMonthlyStatsQueryVariables>(GetIncomeMonthlyStatsDocument, { monthsBack: monthsBack + skipMonths }).pipe(
      map((data) => {
        const stats = data.incomeMonthlyStats;
        if (skipMonths === 0) {
          return stats.slice(-monthsBack);
        }
        return stats.slice(0, stats.length - skipMonths).slice(-monthsBack);
      }),
    );
  }
}
