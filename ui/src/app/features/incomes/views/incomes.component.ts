import { Component, computed, inject, type OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { TableModule } from 'primeng/table';

import { IncomesTableComponent, type IFilterAppliedEvent } from '@features/incomes/components/incomes-table/incomes-table.component';
import { MonthlyIncomeChartComponent } from '@features/incomes/components/monthly-income-chart/monthly-income-chart.component';
import { INCOMES_ROUTES } from '@features/incomes/constants/incomes-routes.constant';
import { incomesPageEvents } from '@features/incomes/store/incomes/incomes.events';
import { type MonthlyStatsScale } from '@features/incomes/types/incomes-state.types';
import { IncomesStatsStore } from '@features/incomes/store/stats/incomes-stats.store';
import { IncomesStore } from '@features/incomes/store/incomes/incomes.store';
import { injectDispatch } from '@ngrx/signals/events';

import { ChartCardComponent } from '@shared/components/chart-card';
import { AppDialogComponent } from '@shared/components/dialog';
import { SegmentedToggleComponent, type ISegmentedToggleOption } from '@shared/components/segmented-toggle';
import { StatGroupComponent } from '@shared/components/stat-card';
import { formatAmount } from '@shared/helpers/money.helper';
import { type IPageNavigationEvent, type IPageSizeChangeEvent, type IStatItem } from '@shared/types';

import { type IncomeId } from '../types/income-id.type';

@Component({
  selector: 'app-incomes',
  imports: [TableModule, SegmentedToggleComponent, IncomesTableComponent, StatGroupComponent, ChartCardComponent, MonthlyIncomeChartComponent, AppDialogComponent, RouterOutlet],
  template: `
    <div class="flex h-full min-w-0 flex-1 gap-8 p-4">
      <div class="flex min-w-0 flex-2 flex-col gap-4 2xl:flex-3">
        <div class="flex items-center justify-end">
          <app-segmented-toggle [options]="statsScopeOptions" [value]="statsScope()" (valueChange)="onStatsScopeChange($event)" />
        </div>
        <app-stat-group [items]="statItems()" />
        <app-incomes-table
          [isLoading]="isLoading()"
          [data]="incomes()"
          [totalRecords]="pagination().totalRecords"
          [rows]="pagination().rows"
          [currentPage]="pagination().currentPage"
          [pageInfo]="pagination().pageInfo"
          (navigatePage)="onNavigatePage($event)"
          (deleteClicked)="onDelete($event)"
          (editClicked)="onEdit($event)"
          (importClicked)="onImport()"
          (addClicked)="onAdd()"
          (pageSizeChange)="onPageSizeChange($event)"
          (filtersApplied)="onFilterApplied($event)"
          (filtersCleared)="onFiltersClear()" />
      </div>
      <div class="min-w-0 flex-1">
        <app-chart-card title="Monthly income" subtitle="Recurring vs non-recurring">
          <div class="mb-4 flex justify-end">
            <app-segmented-toggle [options]="monthlyStatsScaleOptions" [value]="monthlyStatsScale()" (valueChange)="onMonthlyStatsScaleChange($event)" />
          </div>
          <app-monthly-income-chart
            [stats]="monthlyStats()"
            [loading]="monthlyStatsLoading()"
            [offset]="monthlyStatsOffset()"
            [hasMore]="monthlyStatsHasMore()"
            (navigate)="onMonthlyStatsNavigate($event)" />
        </app-chart-card>
      </div>
    </div>
    <app-dialog [visible]="isChildRouteActive()" (visibleChange)="onDialogClose()">
      <router-outlet></router-outlet>
    </app-dialog>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `,
})
export class IncomesComponent implements OnInit {
  readonly #store = inject(IncomesStore);
  readonly #statsStore = inject(IncomesStatsStore);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #dispatch = injectDispatch(incomesPageEvents);

  readonly isChildRouteActive = toSignal(
    this.#router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.#route.children.length > 0),
    ),
    { initialValue: false },
  );

  readonly statsScopeOptions: ISegmentedToggleOption[] = [
    { label: 'Recurring', value: 'recurring' },
    { label: 'All', value: 'all' },
  ];

  readonly monthlyStatsScaleOptions: ISegmentedToggleOption[] = [
    { label: '3 months', value: 'quarter' },
    { label: '6 months', value: 'half' },
    { label: '12 months', value: 'year' },
  ];

  readonly isLoading = computed(() => this.#store.isLoading());
  readonly pagination = computed(() => this.#store.pagination());
  readonly incomes = computed(() => this.#store.entities());
  readonly statsScope = computed(() => this.#statsStore.statsScope());
  readonly monthlyStats = computed(() => this.#statsStore.monthlyStats());
  readonly monthlyStatsLoading = computed(() => this.#statsStore.monthlyStatsLoading());
  readonly monthlyStatsOffset = computed(() => this.#statsStore.monthlyStatsOffset());
  readonly monthlyStatsHasMore = computed(() => this.#statsStore.monthlyStatsHasMore());
  readonly monthlyStatsScale = computed(() => this.#statsStore.monthlyStatsScale());

  readonly statItems = computed((): IStatItem[] => {
    const stats = this.#statsStore.stats();

    if (!stats) {
      return [];
    }

    return [
      {
        title: 'This year recurring',
        value: formatAmount(stats.yearRecurringTotal),
        description: 'since Jan 1 (UTC)',
        showChange: false,
      },
      {
        title: 'Last month recurring',
        value: formatAmount(stats.lastMonthRecurringTotal),
        change: stats.lastMonthRecurringChangePct ?? undefined,
        description: 'vs two months ago',
      },
      {
        title: 'This month recurring',
        value: formatAmount(stats.thisMonthRecurringTotal),
        change: stats.thisMonthRecurringChangePct ?? undefined,
        description: 'vs last month',
      },
      {
        title: 'Last 3 months avg',
        value: formatAmount(stats.last3MonthsRecurringAverage),
        description: 'full months only',
      },
    ];
  });

  ngOnInit(): void {
    this.#dispatch.opened();
  }

  onNavigatePage(event: IPageNavigationEvent): void {
    this.#dispatch.navigatePage({ direction: event.direction, cursor: event.cursor, pageSize: event.pageSize });
  }

  onDelete(_id: IncomeId): void {}

  onAdd(): void {
    void this.#router.navigate([INCOMES_ROUTES.ADD], { relativeTo: this.#route });
  }

  onImport(): void {
    void this.#router.navigate([INCOMES_ROUTES.IMPORT], { relativeTo: this.#route });
  }

  onEdit(id: IncomeId): void {
    void this.#router.navigate([INCOMES_ROUTES.EDIT, id], { relativeTo: this.#route });
  }

  onDialogClose(): void {
    void this.#router.navigate(['.'], { relativeTo: this.#route });
  }

  onPageSizeChange(event: IPageSizeChangeEvent): void {
    this.#dispatch.pageSizeChanged({ rows: event.rows });
  }

  onFilterApplied(event: IFilterAppliedEvent): void {
    this.#dispatch.filterApplied({ filter: event.filter });
  }

  onFiltersClear(): void {
    this.#dispatch.filtersCleared();
  }

  onStatsScopeChange(scope: string): void {
    if (scope !== 'recurring' && scope !== 'all') {
      return;
    }

    if (this.statsScope() === scope) {
      return;
    }

    this.#dispatch.statsScopeChanged({ scope });
  }

  onMonthlyStatsNavigate(direction: 'back' | 'forward'): void {
    this.#dispatch.monthlyStatsNavigate({ direction });
  }

  onMonthlyStatsScaleChange(scale: string): void {
    if (scale !== 'quarter' && scale !== 'half' && scale !== 'year') {
      return;
    }

    if (this.monthlyStatsScale() === scale) {
      return;
    }

    this.#dispatch.monthlyStatsScaleChanged({ scale: scale as MonthlyStatsScale });
  }
}
