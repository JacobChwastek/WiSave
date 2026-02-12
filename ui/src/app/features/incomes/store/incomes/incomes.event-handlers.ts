import { inject } from '@angular/core';
import { catchError, map, merge, of, switchMap, tap } from 'rxjs';

import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';

import { GraphQLRequestError } from '@core/api/graphql';
import { initialPagination, type CursorDirection, type IStoreError } from '@shared/types';

import { IncomesGraphQLService } from '../../services/incomes-graphql.service';
import type { IIncomesQueryParams } from '../../types/incomes-query.types';
import { incomesApiEvents, incomesPageEvents } from './incomes.events';
import { type IIncomesFilter, type IIncomesSortOrder } from '../../types/incomes-state.types';
import { createInitialFilter, emptyFilter, initialSort } from './incomes.state';

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
          map((result) => (result.error ? incomesApiEvents.categoriesLoadedFailure({ error: toStoreError(result.error) }) : incomesApiEvents.categoriesLoadedSuccess({ categories: result.data }))),
          catchError((err) => of(incomesApiEvents.categoriesLoadedFailure({ error: toStoreError(err) }))),
        );

      const getQueryParams = (pageSize: number, direction: CursorDirection, cursor: string | null, filter?: IIncomesFilter, sort?: IIncomesSortOrder): IIncomesQueryParams => ({
        direction,
        cursor,
        pageSize,
        filter,
        sort,
      });

      const getFilter = (): IIncomesFilter => store.filter?.() ?? createInitialFilter();
      const getSort = (): IIncomesSortOrder => store.sort?.() ?? initialSort;
      const getRows = (): number => store.pagination?.().rows ?? initialPagination.rows;

      return {
        loadIncomes$: events
          .on(incomesPageEvents.opened)
          .pipe(switchMap(() => merge(loadIncomes$(getQueryParams(initialPagination.rows, 'first', null, getFilter(), getSort())), loadCategories$()))),

        navigatePage$: events
          .on(incomesPageEvents.navigatePage)
          .pipe(switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.pageSize, payload.direction, payload.cursor, getFilter(), getSort())))),

        pageSizeChanged$: events.on(incomesPageEvents.pageSizeChanged).pipe(switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.rows, 'first', null, getFilter(), getSort())))),

        filterApplied$: events.on(incomesPageEvents.filterApplied).pipe(
          switchMap(({ payload }) => {
            const currentFilter = getFilter();
            const updatedFilter = { ...currentFilter, ...payload.filter };
            return loadIncomes$(getQueryParams(getRows(), 'first', null, updatedFilter, getSort()));
          }),
        ),

        filtersCleared$: events.on(incomesPageEvents.filtersCleared).pipe(switchMap(() => loadIncomes$(getQueryParams(getRows(), 'first', null, emptyFilter, getSort())))),

        sortChanged$: events.on(incomesPageEvents.sortChanged).pipe(switchMap(({ payload }) => loadIncomes$(getQueryParams(getRows(), 'first', null, getFilter(), payload.sort)))),

        selectIncome$: events.on(incomesPageEvents.selectIncome).pipe(
          switchMap(({ payload }) => {
            const cached = store.entityMap()[payload.id];
            if (cached) {
              return of(incomesApiEvents.fetchByIdSuccess({ income: cached }));
            }
            return api.getById(payload.id).pipe(
              map((result) => {
                if (result.error) {
                  return incomesApiEvents.fetchByIdFailure({ error: toStoreError(result.error) });
                }
                if (!result.data) {
                  return incomesApiEvents.fetchByIdFailure({ error: { message: 'Income not found', category: 'validation' } });
                }
                return incomesApiEvents.fetchByIdSuccess({ income: result.data });
              }),
              catchError((err) => of(incomesApiEvents.fetchByIdFailure({ error: toStoreError(err) }))),
            );
          }),
        ),

        logErrors$: events
          .on(
            incomesApiEvents.loadedFailure,
            incomesApiEvents.addedFailure,
            incomesApiEvents.updatedFailure,
            incomesApiEvents.removedFailure,
            incomesApiEvents.fetchByIdFailure,
          )
          .pipe(tap(({ payload }) => console.error('[Incomes API Error]', payload.error.category, payload.error.message))),
      };
    }),
  );
}
