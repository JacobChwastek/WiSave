import { inject } from '@angular/core';
import { catchError, map, merge, of, switchMap, tap } from 'rxjs';

import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';

import { GraphQLRequestError } from '@core/api/graphql';

import { CursorDirection, initialPagination, type IStoreError } from '@shared/types';

import { IIncomesQueryParams, IncomesGraphQLService } from '../services/incomes-graphql.service';
import { incomesApiEvents, incomesPageEvents } from './incomes.events';
import { IncomeStatsScope, IIncomesFilter, IIncomesSortOrder, createInitialFilter, emptyFilter, initialSort, MONTHLY_STATS_SCALE_SIZES, MonthlyStatsScale } from './incomes.state';

const toStoreError = (err: unknown): IStoreError => {
  if (err instanceof GraphQLRequestError) {
    return { message: err.message, category: err.category };
  }
  return { message: err instanceof Error ? err.message : 'Unknown error', category: 'server' };
};

export function withIncomesEventHandlers() {
  return signalStoreFeature(
    withEventHandlers((store: any, events = inject(Events), api = inject(IncomesGraphQLService)) => {
      const loadIncomes$ = (params: IIncomesQueryParams) =>
        api.getAllWithPagination(params).pipe(
          map((result) =>
            incomesApiEvents.loadedSuccess({
              incomes: result.data.incomes,
              totalCount: result.data.totalCount,
              pageInfo: result.data.pageInfo,
              error: result.error ? toStoreError(result.error) : null,
            }),
          ),
          catchError((err) => of(incomesApiEvents.loadedFailure({ error: toStoreError(err) }))),
        );

      const loadCategories$ = () =>
        api.getCategories().pipe(
          map((result) =>
            result.error
              ? incomesApiEvents.categoriesLoadedFailure({ error: toStoreError(result.error) })
              : incomesApiEvents.categoriesLoadedSuccess({ categories: result.data }),
          ),
          catchError((err) => of(incomesApiEvents.categoriesLoadedFailure({ error: toStoreError(err) }))),
        );

      const loadStats$ = (scope: IncomeStatsScope) =>
        api.getIncomeStats(scope === 'all').pipe(
          map((result) =>
            result.error
              ? incomesApiEvents.statsLoadedFailure({ error: toStoreError(result.error) })
              : incomesApiEvents.statsLoadedSuccess({ stats: result.data }),
          ),
          catchError((err) => of(incomesApiEvents.statsLoadedFailure({ error: toStoreError(err) }))),
        );

      const loadMonthlyStats$ = (scale: MonthlyStatsScale, offset = 0) => {
        const pageSize = MONTHLY_STATS_SCALE_SIZES[scale];
        return api.getIncomeMonthlyStats(pageSize, offset).pipe(
          map((result) =>
            result.error
              ? incomesApiEvents.monthlyStatsLoadedFailure({ error: toStoreError(result.error) })
              : incomesApiEvents.monthlyStatsLoadedSuccess({ stats: result.data }),
          ),
          catchError((err) => of(incomesApiEvents.monthlyStatsLoadedFailure({ error: toStoreError(err) }))),
        );
      };

      const getQueryParams = (
        pageSize: number,
        direction: CursorDirection,
        cursor: string | null,
        filter?: IIncomesFilter,
        sort?: IIncomesSortOrder,
      ): IIncomesQueryParams => ({
        direction,
        cursor,
        pageSize,
        filter,
        sort,
      });

      const getFilter = (): IIncomesFilter => store.filter?.() ?? createInitialFilter();
      const getSort = (): IIncomesSortOrder => store.sort?.() ?? initialSort;
      const getRows = (): number => store.pagination?.().rows ?? initialPagination.rows;
      const getStatsScope = (): IncomeStatsScope => store.statsScope?.() ?? 'recurring';
      const getMonthlyStatsOffset = (): number => store.monthlyStatsOffset?.() ?? 0;
      const getMonthlyStatsScale = (): MonthlyStatsScale => store.monthlyStatsScale?.() ?? 'quarter';

      return {
        loadIncomes$: events.on(incomesPageEvents.opened).pipe(
          switchMap(() =>
            merge(
              loadIncomes$(getQueryParams(initialPagination.rows, 'first', null, getFilter(), getSort())),
              loadCategories$(),
              loadStats$(getStatsScope()),
              loadMonthlyStats$(getMonthlyStatsScale(), getMonthlyStatsOffset()),
            ),
          ),
        ),

        statsScopeChanged$: events.on(incomesPageEvents.statsScopeChanged).pipe(
          switchMap(({ payload }) => loadStats$(payload.scope)),
        ),

        monthlyStatsNavigate$: events.on(incomesPageEvents.monthlyStatsNavigate).pipe(
          switchMap(() => loadMonthlyStats$(getMonthlyStatsScale(), getMonthlyStatsOffset())),
        ),

        monthlyStatsScaleChanged$: events.on(incomesPageEvents.monthlyStatsScaleChanged).pipe(
          switchMap(({ payload }) => loadMonthlyStats$(payload.scale, 0)),
        ),

        navigatePage$: events.on(incomesPageEvents.navigatePage).pipe(
          switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.pageSize, payload.direction, payload.cursor, getFilter(), getSort()))),
        ),

        pageSizeChanged$: events.on(incomesPageEvents.pageSizeChanged).pipe(
          switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.rows, 'first', null, getFilter(), getSort()))),
        ),

        filterApplied$: events.on(incomesPageEvents.filterApplied).pipe(
          switchMap(({ payload }) => {
            const currentFilter = getFilter();
            const updatedFilter = { ...currentFilter, ...payload.filter };
            return loadIncomes$(getQueryParams(getRows(), 'first', null, updatedFilter, getSort()));
          }),
        ),

        filtersCleared$: events.on(incomesPageEvents.filtersCleared).pipe(
          switchMap(() => loadIncomes$(getQueryParams(getRows(), 'first', null, emptyFilter, getSort()))),
        ),

        sortChanged$: events.on(incomesPageEvents.sortChanged).pipe(
          switchMap(({ payload }) => loadIncomes$(getQueryParams(getRows(), 'first', null, getFilter(), payload.sort))),
        ),

        logErrors$: events
          .on(
            incomesApiEvents.loadedFailure,
            incomesApiEvents.addedFailure,
            incomesApiEvents.updatedFailure,
            incomesApiEvents.removedFailure,
            incomesApiEvents.statsLoadedFailure,
            incomesApiEvents.monthlyStatsLoadedFailure,
          )
          .pipe(tap(({ payload }) => console.error('[Incomes API Error]', payload.error.category, payload.error.message))),
      };
    }),
  );
}
