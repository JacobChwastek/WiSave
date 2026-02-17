import { Component, computed, inject, type OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { TableModule } from 'primeng/table';

import { IncomesTableComponent, type IFilterAppliedEvent } from '@features/incomes/components/incomes-table/incomes-table.component';
import { MonthlyIncomeChartComponent } from '@features/incomes/components/monthly-income-chart/monthly-income-chart.component';
import { INCOMES_ROUTES } from '@features/incomes/constants/incomes-routes.constant';
import { incomesPageEvents } from '@features/incomes/+store/incomes/incomes.events';
import { IncomesStatsStore } from '@features/incomes/+store/stats/incomes-stats.store';
import { IncomesStore } from '@features/incomes/+store/incomes/incomes.store';
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
        <app-chart-card title="Yearly income">
          <app-monthly-income-chart
            [stats]="monthlyStats()"
            [loading]="monthlyStatsLoading()"
            [year]="monthlyStatsYear()"
            (navigate)="onMonthlyStatsYearChange($event)" />
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


  readonly isLoading = computed(() => this.#store.isLoading());
  readonly pagination = computed(() => this.#store.pagination());
  readonly incomes = computed(() => this.#store.entities());
  readonly statsScope = computed(() => this.#statsStore.statsScope());
  readonly monthlyStats = computed(() => this.#statsStore.monthlyStats());
  readonly monthlyStatsLoading = computed(() => this.#statsStore.monthlyStatsLoading());
  readonly monthlyStatsYear = computed(() => this.#statsStore.monthlyStatsYear());

  readonly statItems = computed((): IStatItem[] => {
    const stats = this.#statsStore.stats();

    if (!stats) {
      return [];
    }

    const lastYear = new Date().getFullYear() - 1;
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

    return [
      {
        title: 'Last year',
        value: formatAmount(stats.lastYearTotal),
        description: `total ${lastYear}`,
      },
      {
        title: 'This year',
        value: formatAmount(stats.thisYearTotal),
        description: 'year to date',
      },
      {
        title: 'This month',
        value: formatAmount(stats.thisMonthTotal),
        description: currentMonth,
      },
      {
        title: 'Avg last 3 months',
        value: formatAmount(stats.last3MonthsAverage),
        description: 'full months only',
      },
      {
        title: 'Avg last year',
        value: formatAmount(stats.lastYearMonthlyAverage),
        description: `monthly avg ${lastYear}`,
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

  onMonthlyStatsYearChange(direction: 'back' | 'forward'): void {
    this.#dispatch.monthlyStatsYearChanged({ direction });
  }
}
