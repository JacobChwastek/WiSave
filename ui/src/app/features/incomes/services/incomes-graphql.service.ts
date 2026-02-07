import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GraphQLService } from '@graphql/services/graphql.service';
import type { IGraphQLResult } from '@graphql/types/graphql.types';

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

  getAll(variables?: GetIncomesQueryVariables): Observable<IGraphQLResult<IIncome[]>> {
    return this.#graphql.query<GetIncomesQuery, GetIncomesQueryVariables>(GetIncomesDocument, variables).pipe(
      map((result) => ({
        data: this.#mapper.mapToIncomes(result.data?.incomes?.nodes ?? []),
        error: result.error,
      })),
    );
  }

  getAllWithPagination(params: IIncomesQueryParams): Observable<IGraphQLResult<IIncomesQueryResult>> {
    const variables = this.#buildQueryVariables(params);

    return this.#graphql.query<GetIncomesQuery, GetIncomesQueryVariables>(GetIncomesDocument, variables).pipe(
      map((result) => {
        const incomes = result.data?.incomes;
        return {
          data: {
            incomes: this.#mapper.mapToIncomes(incomes?.nodes ?? []),
            totalCount: incomes?.totalCount ?? 0,
            pageInfo: {
              hasNextPage: incomes?.pageInfo.hasNextPage ?? false,
              hasPreviousPage: incomes?.pageInfo.hasPreviousPage ?? false,
              startCursor: incomes?.pageInfo.startCursor ?? null,
              endCursor: incomes?.pageInfo.endCursor ?? null,
            },
          },
          error: result.error,
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
      const sortDirection = sort.direction.toUpperCase() as 'ASC' | 'DESC';
      const order: NonNullable<GetIncomesQueryVariables['order']> = [{ [sort.field]: sortDirection }, { id: sortDirection }];
      variables.order = order;
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

  getById(id: string): Observable<IGraphQLResult<IIncome | null>> {
    return this.#graphql
      .query<GetIncomeByIdQuery, GetIncomeByIdQueryVariables>(GetIncomeByIdDocument, { id })
      .pipe(
        map((result) => ({
          data: result.data?.incomeById ? this.#mapper.mapToIncome(result.data.incomeById) : null,
          error: result.error,
        })),
      );
  }

  getTotalAmount(currency?: string): Observable<IGraphQLResult<number>> {
    return this.#graphql.query<GetTotalAmountQuery, GetTotalAmountQueryVariables>(GetTotalAmountDocument, { currency }).pipe(
      map((result) => ({
        data: result.data?.totalAmount ?? 0,
        error: result.error,
      })),
    );
  }

  getCategories(): Observable<IGraphQLResult<string[]>> {
    return this.#graphql.query<GetCategoriesQuery, Record<string, never>>(GetCategoriesDocument).pipe(
      map((result) => ({
        data: result.data?.categories ?? [],
        error: result.error,
      })),
    );
  }

  getIncomeStats(includeNonRecurring = false): Observable<IGraphQLResult<IIncomeStats>> {
    return this.#graphql.query<GetIncomeStatsQuery, GetIncomeStatsQueryVariables>(GetIncomeStatsDocument, { includeNonRecurring }).pipe(
      map((result) => ({
        data: {
          yearRecurringTotal: result.data?.incomeStats.yearRecurringTotal ?? 0,
          lastMonthRecurringTotal: result.data?.incomeStats.lastMonthRecurringTotal ?? 0,
          lastMonthRecurringChangePct: result.data?.incomeStats.lastMonthRecurringChangePct ?? null,
          thisMonthRecurringTotal: result.data?.incomeStats.thisMonthRecurringTotal ?? 0,
          thisMonthRecurringChangePct: result.data?.incomeStats.thisMonthRecurringChangePct ?? null,
          last3MonthsRecurringAverage: result.data?.incomeStats.last3MonthsRecurringAverage ?? 0,
        },
        error: result.error,
      })),
    );
  }

  getIncomeMonthlyStats(monthsBack = 5, offset = 0): Observable<IGraphQLResult<IIncomeMonthlyStats[]>> {
    const skipMonths = offset * monthsBack;
    return this.#graphql
      .query<GetIncomeMonthlyStatsQuery, GetIncomeMonthlyStatsQueryVariables>(GetIncomeMonthlyStatsDocument, { monthsBack: monthsBack + skipMonths })
      .pipe(
        map((result) => {
          const stats = result.data?.incomeMonthlyStats ?? [];
          const sliced = skipMonths === 0 ? stats.slice(-monthsBack) : stats.slice(0, stats.length - skipMonths).slice(-monthsBack);
          return { data: sliced, error: result.error };
        }),
      );
  }
}
