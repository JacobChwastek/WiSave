import { withDevtools, withGlitchTracking, withTrackedReducer } from '@angular-architects/ngrx-toolkit';
import { signalStore, withState } from '@ngrx/signals';
import { on } from '@ngrx/signals/events';

import { incomesApiEvents, incomesPageEvents } from '../incomes/incomes.events';
import { withIncomesStatsEventHandlers } from './incomes-stats.event-handlers';
import { initialStatsState } from './incomes-stats.state';

export const IncomesStatsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('IncomesStats', withGlitchTracking()),
  withState(initialStatsState),
  withTrackedReducer(
    on(incomesPageEvents.opened, () => ({ statsLoading: true, monthlyStatsLoading: true, error: null })),
    on(incomesPageEvents.statsScopeChanged, ({ payload }) => ({ statsScope: payload.scope, statsLoading: true })),
    on(incomesPageEvents.monthlyStatsNavigate, ({ payload }, state) => ({
      monthlyStatsLoading: true,
      monthlyStatsOffset: payload.direction === 'back' ? state.monthlyStatsOffset + 1 : Math.max(0, state.monthlyStatsOffset - 1),
    })),
    on(incomesPageEvents.monthlyStatsScaleChanged, ({ payload }) => ({
      monthlyStatsLoading: true,
      monthlyStatsScale: payload.scale,
      monthlyStatsOffset: 0,
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
      monthlyStatsHasMore: payload.stats.length > 0,
      error: null,
    })),
    on(incomesApiEvents.monthlyStatsLoadedFailure, ({ payload }) => ({
      monthlyStatsLoading: false,
      error: payload.error,
    })),
  ),
  withIncomesStatsEventHandlers(),
);
