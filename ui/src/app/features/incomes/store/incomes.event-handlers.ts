import { inject } from '@angular/core';
import { merge, switchMap, tap } from 'rxjs';

import { mapResponse } from '@ngrx/operators';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';

import { CursorDirection, initialPagination } from '@shared/types';

import { IIncomesQueryParams, IncomesGraphQLService } from '../services/incomes-graphql.service';
import { incomesApiEvents, incomesPageEvents } from './incomes.events';
import { IncomeStatsScope, IIncomesFilter, IIncomesSortOrder, initialFilter, initialSort } from './incomes.state';

export function withIncomesEventHandlers() {
  return signalStoreFeature(
    withEventHandlers((store: any, events = inject(Events), api = inject(IncomesGraphQLService)) => {
      const loadIncomes$ = (params: IIncomesQueryParams) =>
        api.getAllWithPagination(params).pipe(
          mapResponse({
            next: (result) =>
              incomesApiEvents.loadedSuccess({
                incomes: result.incomes,
                totalCount: result.totalCount,
                pageInfo: result.pageInfo,
              }),
            error: (error: { message: string }) => incomesApiEvents.loadedFailure({ error: error.message }),
          }),
        );

      const loadCategories$ = () =>
        api.getCategories().pipe(
          mapResponse({
            next: (categories) => incomesApiEvents.categoriesLoadedSuccess({ categories }),
            error: (error: { message: string }) => incomesApiEvents.categoriesLoadedFailure({ error: error.message }),
          }),
        );

      const loadStats$ = (scope: IncomeStatsScope) =>
        api.getIncomeStats(scope === 'all').pipe(
          mapResponse({
            next: (stats) => incomesApiEvents.statsLoadedSuccess({ stats }),
            error: (error: { message: string }) => incomesApiEvents.statsLoadedFailure({ error: error.message }),
          }),
        );

      const loadMonthlyStats$ = () =>
        api.getIncomeMonthlyStats().pipe(
          mapResponse({
            next: (stats) => incomesApiEvents.monthlyStatsLoadedSuccess({ stats }),
            error: (error: { message: string }) => incomesApiEvents.monthlyStatsLoadedFailure({ error: error.message }),
          }),
        );

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

      const getFilter = (): IIncomesFilter => store.filter?.() ?? initialFilter;
      const getSort = (): IIncomesSortOrder => store.sort?.() ?? initialSort;
      const getRows = (): number => store.pagination?.().rows ?? initialPagination.rows;
      const getStatsScope = (): IncomeStatsScope => store.statsScope?.() ?? 'recurring';

      return {
        loadIncomes$: events.on(incomesPageEvents.opened).pipe(
          switchMap(() =>
            merge(
              loadIncomes$(getQueryParams(initialPagination.rows, 'first', null, getFilter(), getSort())),
              loadCategories$(),
              loadStats$(getStatsScope()),
              loadMonthlyStats$(),
            ),
          ),
        ),

        statsScopeChanged$: events.on(incomesPageEvents.statsScopeChanged).pipe(
          switchMap(({ payload }) => loadStats$(payload.scope)),
        ),

        navigatePage$: events.on(incomesPageEvents.navigatePage).pipe(
          switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.pageSize, payload.direction, payload.cursor, getFilter(), getSort()))),
        ),

        pageSizeChanged$: events.on(incomesPageEvents.pageSizeChanged).pipe(
          switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.rows, 'first', null, getFilter(), getSort()))),
        ),

        filterApplied$: events.on(incomesPageEvents.filterApplied).pipe(
          tap(({ payload }) => console.log('[EventHandler] filterApplied received:', payload)),
          switchMap(({ payload }) => {
            const currentFilter = getFilter();
            const updatedFilter = { ...currentFilter, ...payload.filter };
            console.log('[EventHandler] Updated filter:', updatedFilter);
            return loadIncomes$(getQueryParams(getRows(), 'first', null, updatedFilter, getSort()));
          }),
        ),

        filtersCleared$: events.on(incomesPageEvents.filtersCleared).pipe(
          tap(() => console.log('[EventHandler] filtersCleared received')),
          switchMap(() => loadIncomes$(getQueryParams(getRows(), 'first', null, initialFilter, getSort()))),
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
          .pipe(tap(({ payload }) => console.error('[Incomes API Error]', payload))),
      };
    }),
  );
}
