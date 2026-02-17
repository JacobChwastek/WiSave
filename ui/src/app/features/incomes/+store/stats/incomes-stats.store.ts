import { withDevtools, withGlitchTracking, withTrackedReducer } from '@angular-architects/ngrx-toolkit';
import { signalStore, withFeature, withState } from '@ngrx/signals';
import { on } from '@ngrx/signals/events';

import { incomesApiEvents, incomesPageEvents } from '../incomes/incomes.events';
import { withIncomesStatsEventHandlers as withEventHandlers } from './incomes-stats.event-handlers';
import { initialStatsState } from './incomes-stats.state';

export const IncomesStatsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('IncomesStats', withGlitchTracking()),
  withState(initialStatsState),
  withTrackedReducer(
    on(incomesPageEvents.opened, () => ({ statsLoading: true, monthlyStatsLoading: true, error: null })),
    on(incomesPageEvents.statsScopeChanged, ({ payload }) => ({ statsScope: payload.scope, statsLoading: true })),
    on(incomesPageEvents.monthlyStatsYearChanged, ({ payload }, state) => ({
      monthlyStatsLoading: true,
      monthlyStatsYear: payload.direction === 'back' ? state.monthlyStatsYear - 1 : state.monthlyStatsYear + 1,
    })),
    on(incomesApiEvents.statsLoadedSuccess, ({ payload }) => ({
      stats: payload.stats,
      statsLoading: false,
      error: null,
    })),
    on(incomesApiEvents.statsLoadedFailure, ({ payload }) => ({
      statsLoading: false,
      error: payload.error,
    })),
    on(incomesApiEvents.monthlyStatsLoadedSuccess, ({ payload }) => ({
      monthlyStats: payload.stats,
      monthlyStatsLoading: false,
      error: null,
    })),
    on(incomesApiEvents.monthlyStatsLoadedFailure, ({ payload }) => ({
      monthlyStatsLoading: false,
      error: payload.error,
    })),
  ),
  withFeature((store) => withEventHandlers(store)),
);
