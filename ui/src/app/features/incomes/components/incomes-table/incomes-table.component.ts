import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutoComplete } from 'primeng/autocomplete';
import { Button, ButtonDirective, ButtonIcon } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { IIncomesFilter } from '@features/incomes/store/incomes.state';
import { IIncome } from '@features/incomes/types/incomes.interfaces';

import { Currency } from '@core/types';
import { ButtonBarDatepickerComponent } from '@shared/components/datepicker/button-bar-datepicker';
import { CursorPaginationComponent } from '@shared/components/pagination';
import { IPageInfo, IPageNavigationEvent, IPageSizeChangeEvent } from '@shared/types';

export interface IFilterAppliedEvent {
  filter: Partial<IIncomesFilter>;
}

@Component({
  selector: 'app-incomes-table',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    AutoComplete,
    Button,
    ButtonDirective,
    ButtonIcon,
    Chip,
    DatePicker,
    InputText,
    Ripple,
    TableModule,
    ToggleSwitch,
    ButtonBarDatepickerComponent,
    CursorPaginationComponent,
  ],
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

  readonly datesFilter = signal<Date[] | null>(null);

  filteredCategories: string[] = [];

  readonly #clonedIncomes = new Map<string, IIncome>();

  readonly totalAmount = computed(() => this.data().reduce((sum, income) => sum + income.amount.amount, 0));
  readonly totalCurrency = computed(() => this.data()[0]?.amount.currency ?? Currency.PLN);

  readonly availableCategories = computed(() => {
    const allCategories = this.data().flatMap((income) => income.category);
    return [...new Set(allCategories)].sort();
  });

  filterCategories(event: { query: string }): void {
    const query = event.query.toLowerCase();
    const available = this.availableCategories();

    this.filteredCategories = available.filter((cat) => cat.toLowerCase().includes(query));

    if (query && !this.filteredCategories.some((cat) => cat.toLowerCase() === query)) {
      this.filteredCategories.push(query);
    }
  }

  onDatesFilterChange(dates: Date[] | null): void {
    this.datesFilter.set(dates);
  }

  onRowEditInit(income: IIncome): void {
    this.#clonedIncomes.set(income.id, { ...income });
  }

  onRowEditSave(income: IIncome): void {
    this.#clonedIncomes.delete(income.id);
  }

  onRowEditCancel(income: IIncome, index: number): void {
    const cloned = this.#clonedIncomes.get(income.id);
    if (cloned) {
      this.data()[index] = cloned;
    }
    this.#clonedIncomes.delete(income.id);
  }

  onRowArchive(_income: IIncome, index: number): void {
    this.data().splice(index, 1);
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
    this.filtersCleared.emit();
  }

  uploadIncomes(): void {}

  addNewIncome(): void {}
}
