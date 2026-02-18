import { inject, type Signal } from '@angular/core';
import { catchError, exhaustMap, map, merge, of, switchMap, tap } from 'rxjs';

import { signalStoreFeature, withProps } from '@ngrx/signals';
import { type EntityMap } from '@ngrx/signals/entities';
import { Events, withEventHandlers } from '@ngrx/signals/events';

import { toStoreError } from '@shared/helpers/store-error.helper';
import { initialPagination, type CursorDirection, type IPagination } from '@shared/types';

import { IncomesGraphQLService } from '../../services/incomes-graphql.service';
import type { IIncomesQueryParams } from '../../types/incomes-query.types';
import { type IIncomesFilter, type IIncomesSortOrder } from '../../types/incomes-state.types';
import { type IIncome } from '../../types/incomes.interfaces';
import { incomesApiEvents, incomesPageEvents } from './incomes.events';
import { emptyFilter } from './incomes.state';

export interface IncomesStoreSlice {
  filter: Signal<IIncomesFilter>;
  sort: Signal<IIncomesSortOrder>;
  pagination: Signal<IPagination>;
  entityMap: Signal<EntityMap<IIncome>>;
}

export function withIncomesEventHandlers(store: IncomesStoreSlice) {
  return signalStoreFeature(
    withProps(() => ({
      _events: inject(Events),
      _api: inject(IncomesGraphQLService),
    })),
    withEventHandlers((props) => {
      const loadIncomes$ = (params: IIncomesQueryParams) =>
        props._api.getAllWithPagination(params).pipe(
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
        props._api.getCategories().pipe(
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

      return {
        loadIncomes$: props._events
          .on(incomesPageEvents.opened)
          .pipe(exhaustMap(() => merge(loadIncomes$(getQueryParams(initialPagination.rows, 'first', null, store.filter(), store.sort())), loadCategories$()))),

        navigatePage$: props._events
          .on(incomesPageEvents.navigatePage)
          .pipe(switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.pageSize, payload.direction, payload.cursor, store.filter(), store.sort())))),

        pageSizeChanged$: props._events.on(incomesPageEvents.pageSizeChanged).pipe(switchMap(({ payload }) => loadIncomes$(getQueryParams(payload.rows, 'first', null, store.filter(), store.sort())))),

        filterApplied$: props._events.on(incomesPageEvents.filterApplied).pipe(
          switchMap(({ payload }) => {
            const updatedFilter = { ...store.filter(), ...payload.filter };
            return loadIncomes$(getQueryParams(store.pagination().rows, 'first', null, updatedFilter, store.sort()));
          }),
        ),

        filtersCleared$: props._events.on(incomesPageEvents.filtersCleared).pipe(switchMap(() => loadIncomes$(getQueryParams(store.pagination().rows, 'first', null, emptyFilter, store.sort())))),

        sortChanged$: props._events
          .on(incomesPageEvents.sortChanged)
          .pipe(switchMap(({ payload }) => loadIncomes$(getQueryParams(store.pagination().rows, 'first', null, store.filter(), payload.sort)))),

        selectIncome$: props._events.on(incomesPageEvents.selectIncome).pipe(
          exhaustMap(({ payload }) => {
            const cached = store.entityMap()[payload.id];
            if (cached) {
              return of(incomesApiEvents.fetchByIdSuccess({ income: cached }));
            }
            return props._api.getById(payload.id).pipe(
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

        logErrors$: props._events
          .on(incomesApiEvents.loadedFailure, incomesApiEvents.addedFailure, incomesApiEvents.updatedFailure, incomesApiEvents.removedFailure, incomesApiEvents.fetchByIdFailure)
          .pipe(tap(({ payload }) => console.error('[Incomes API Error]', payload.error.category, payload.error.message))),
      };
    }),
  );
}
