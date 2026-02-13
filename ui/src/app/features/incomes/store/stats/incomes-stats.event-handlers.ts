import { inject } from '@angular/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';

import { GraphQLRequestError } from '@core/api/graphql';
import { type IStoreError } from '@shared/types';

import { IncomesGraphQLService } from '../../services/incomes-graphql.service';
import { MONTHLY_STATS_SCALE_SIZES, type IncomeStatsScope, type MonthlyStatsScale } from '../../types/incomes-state.types';
import { incomesApiEvents, incomesPageEvents } from '../incomes/incomes.events';

const toStoreError = (err: unknown): IStoreError => {
  if (err instanceof GraphQLRequestError) {
    return { message: err.message, category: err.category };
  }
  return { message: err instanceof Error ? err.message : 'Unknown error', category: 'server' };
};

export function withIncomesStatsEventHandlers() {
  return signalStoreFeature(
    withEventHandlers((store: any, events = inject(Events), api = inject(IncomesGraphQLService)) => {
      const loadStats$ = (scope: IncomeStatsScope) =>
        api.getIncomeStats(scope === 'all').pipe(
          map((result) => (result.error ? incomesApiEvents.statsLoadedFailure({ error: toStoreError(result.error) }) : incomesApiEvents.statsLoadedSuccess({ stats: result.data }))),
          catchError((err) => of(incomesApiEvents.statsLoadedFailure({ error: toStoreError(err) }))),
        );

      const loadMonthlyStats$ = (scale: MonthlyStatsScale, offset = 0) => {
        const pageSize = MONTHLY_STATS_SCALE_SIZES[scale];
        return api.getIncomeMonthlyStats(pageSize, offset).pipe(
          map((result) => (result.error ? incomesApiEvents.monthlyStatsLoadedFailure({ error: toStoreError(result.error) }) : incomesApiEvents.monthlyStatsLoadedSuccess({ stats: result.data }))),
          catchError((err) => of(incomesApiEvents.monthlyStatsLoadedFailure({ error: toStoreError(err) }))),
        );
      };

      const getStatsScope = (): IncomeStatsScope => store.statsScope?.() ?? 'recurring';
      const getMonthlyStatsOffset = (): number => store.monthlyStatsOffset?.() ?? 0;
      const getMonthlyStatsScale = (): MonthlyStatsScale => store.monthlyStatsScale?.() ?? 'quarter';

      return {
        loadStats$: events
          .on(incomesPageEvents.opened)
          .pipe(switchMap(() => loadStats$(getStatsScope()))),

        loadMonthlyStats$: events
          .on(incomesPageEvents.opened)
          .pipe(switchMap(() => loadMonthlyStats$(getMonthlyStatsScale(), getMonthlyStatsOffset()))),

        statsScopeChanged$: events.on(incomesPageEvents.statsScopeChanged).pipe(switchMap(({ payload }) => loadStats$(payload.scope))),

        monthlyStatsNavigate$: events.on(incomesPageEvents.monthlyStatsNavigate).pipe(switchMap(() => loadMonthlyStats$(getMonthlyStatsScale(), getMonthlyStatsOffset()))),

        monthlyStatsScaleChanged$: events.on(incomesPageEvents.monthlyStatsScaleChanged).pipe(switchMap(({ payload }) => loadMonthlyStats$(payload.scale, 0))),

        logErrors$: events
          .on(incomesApiEvents.statsLoadedFailure, incomesApiEvents.monthlyStatsLoadedFailure)
          .pipe(tap(({ payload }) => console.error('[Income Stats API Error]', payload.error.category, payload.error.message))),
      };
    }),
  );
}
