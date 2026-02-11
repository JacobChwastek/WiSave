import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';

import { ConfirmationService } from 'primeng/api';
import { Button, ButtonDirective, ButtonIcon } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';

import { type IIncomesFilter } from '@features/incomes/store/incomes.state';
import { type IIncome, type IncomeId } from '@features/incomes/types/incomes.interfaces';

import { Currency } from '@core/types';
import { ButtonBarDatepickerComponent } from '@shared/components/datepicker/button-bar-datepicker';
import { CursorPaginationComponent } from '@shared/components/pagination';
import { type IPageInfo, type IPageNavigationEvent, type IPageSizeChangeEvent } from '@shared/types';

export interface IFilterAppliedEvent {
  filter: Partial<IIncomesFilter>;
}

@Component({
  selector: 'app-incomes-table',
  imports: [CurrencyPipe, DatePipe, Button, ButtonDirective, ButtonIcon, Chip, ConfirmPopupModule, Ripple, TableModule, ButtonBarDatepickerComponent, CursorPaginationComponent],
  providers: [ConfirmationService],
  templateUrl: './incomes-table.component.html',
  styles: `
    :host {
      display: flex;
      flex: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomesTableComponent {
  readonly #confirmationService = inject(ConfirmationService);

  readonly isLoading = input.required<boolean>();
  readonly data = input.required<IIncome[]>();
  readonly totalRecords = input<number>(0);
  readonly rows = input<number>(10);
  readonly currentPage = input<number>(1);
  readonly pageInfo = input.required<IPageInfo>();

  readonly navigatePage = output<IPageNavigationEvent>();
  readonly pageSizeChange = output<IPageSizeChangeEvent>();
  readonly filtersApplied = output<IFilterAppliedEvent>();

  readonly filtersCleared = output<void>();

  readonly editClicked = output<IncomeId>();
  readonly deleteClicked = output<IncomeId>();
  readonly importClicked = output<void>();
  readonly addClicked = output<void>();

  readonly datesFilter = signal<Date[] | null>(
    (() => {
      const now = new Date();
      return [new Date(now.getFullYear(), now.getMonth(), 1), now];
    })(),
  );

  readonly totalAmount = computed(() => this.data().reduce((sum, income) => sum + income.amount.amount, 0));
  readonly totalCurrency = computed(() => this.data()[0]?.amount.currency ?? Currency.PLN);

  onDatesFilterChange(dates: Date[] | null): void {
    this.datesFilter.set(dates);
  }

  filter(): void {
    const dates = this.datesFilter();

    if (!dates || dates.length === 0) {
      return;
    }

    this.filtersApplied.emit({
      filter: {
        dateRange: {
          from: dates?.[0] ?? null,
          to: dates?.[1] ?? null,
        },
      },
    });
  }

  clearFilters(): void {
    this.datesFilter.set(null);
    this.filtersCleared.emit();
  }

  uploadIncomes(): void {
    this.importClicked.emit();
  }

  addNewIncome(): void {
    this.addClicked.emit();
  }

  editIncome(_income: IIncome): void {
    this.editClicked.emit(_income.id);
  }

  onRowDelete(event: Event, income: IIncome): void {
    this.#confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: `Delete "${income.description}"?`,
      icon: 'pi pi-trash',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
        size: 'small',
      },
      accept: () => {
        this.deleteClicked.emit(income.id);
      },
    });
  }
}
