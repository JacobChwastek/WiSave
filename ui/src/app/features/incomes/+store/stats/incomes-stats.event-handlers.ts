import { inject } from '@angular/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';

import { toStoreError } from '@shared/helpers/store-error.helper';

import { IncomesGraphQLService } from '../../services/incomes-graphql.service';
import { type IncomeStatsScope } from '../../types/incomes-state.types';
import { incomesApiEvents, incomesPageEvents } from '../incomes/incomes.events';

export function withIncomesStatsEventHandlers() {
  return signalStoreFeature(
    withEventHandlers((store: any, events = inject(Events), api = inject(IncomesGraphQLService)) => {
      const loadStats$ = (scope: IncomeStatsScope) =>
        api.getIncomeStats(scope === 'all').pipe(
          map((result) => (result.error ? incomesApiEvents.statsLoadedFailure({ error: toStoreError(result.error) }) : incomesApiEvents.statsLoadedSuccess({ stats: result.data }))),
          catchError((err) => of(incomesApiEvents.statsLoadedFailure({ error: toStoreError(err) }))),
        );

      const loadMonthlyStats$ = (year: number) => {
        return api.getIncomeMonthlyStats(year).pipe(
          map((result) => (result.error ? incomesApiEvents.monthlyStatsLoadedFailure({ error: toStoreError(result.error) }) : incomesApiEvents.monthlyStatsLoadedSuccess({ stats: result.data }))),
          catchError((err) => of(incomesApiEvents.monthlyStatsLoadedFailure({ error: toStoreError(err) }))),
        );
      };

      const getStatsScope = (): IncomeStatsScope => store.statsScope?.() ?? 'recurring';
      const getMonthlyStatsYear = (): number => store.monthlyStatsYear?.() ?? new Date().getFullYear();

      return {
        loadStats$: events
          .on(incomesPageEvents.opened)
          .pipe(switchMap(() => loadStats$(getStatsScope()))),

        loadMonthlyStats$: events
          .on(incomesPageEvents.opened)
          .pipe(switchMap(() => loadMonthlyStats$(getMonthlyStatsYear()))),

        statsScopeChanged$: events.on(incomesPageEvents.statsScopeChanged).pipe(switchMap(({ payload }) => loadStats$(payload.scope))),

        monthlyStatsYearChanged$: events.on(incomesPageEvents.monthlyStatsYearChanged).pipe(switchMap(() => loadMonthlyStats$(getMonthlyStatsYear()))),

        logErrors$: events
          .on(incomesApiEvents.statsLoadedFailure, incomesApiEvents.monthlyStatsLoadedFailure)
          .pipe(tap(({ payload }) => console.error('[Income Stats API Error]', payload.error.category, payload.error.message))),
      };
    }),
  );
}
