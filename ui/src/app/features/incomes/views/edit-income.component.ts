import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { Button } from 'primeng/button';

import { incomesPageEvents } from '@features/incomes/+store/incomes/incomes.events';
import { IncomesStore } from '@features/incomes/+store/incomes/incomes.store';
import { IncomeEditFormComponent } from '@features/incomes/components/income-edit-form/income-edit-form.component';
import { asIncomeId } from '@features/incomes/types/income-id.type';
import { type IIncome } from '@features/incomes/types/incomes.interfaces';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  selector: 'app-edit-income',
  imports: [IncomeEditFormComponent, Button],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-secondary-900 dark:text-dark-secondary-50 text-lg font-semibold">Edit income</h2>
        <p class="text-secondary-500 dark:text-dark-secondary-300 text-sm">Update income details and save your changes.</p>
      </div>

      @if (isFetchingIncome()) {
        <div class="text-secondary-500 dark:text-dark-secondary-300 flex min-h-56 items-center justify-center gap-3">
          <i class="pi pi-spinner pi-spin text-lg"></i>
          <span>Loading income...</span>
        </div>
      } @else if (income()) {
        <app-income-edit-form [income]="income()" [categories]="categories()" [isLoading]="isBusy()" (submitted)="onSubmit($event)" (cancelled)="onCancel()" />
      } @else {
        <div class="border-secondary-200 dark:border-dark-divider flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
          <i class="pi pi-exclamation-triangle text-warning-500 text-xl"></i>
          <div class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium">Income not found</div>
          <p class="text-secondary-500 dark:text-dark-secondary-300 text-sm">This income might have been removed or is not available.</p>
          <p-button (click)="onCancel()" label="Close" severity="secondary" />
        </div>
      }
    </div>
  `,
})
export class EditIncomeComponent {
  readonly #store = inject(IncomesStore);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #dispatch = injectDispatch(incomesPageEvents);

  readonly incomeId = toSignal(
    this.#route.paramMap.pipe(
      map((params) => params.get('id')),
      map((id) => (id ? asIncomeId(id) : null)),
    ),
    { initialValue: null },
  );

  readonly income = computed(() => this.#store.selectedIncome());
  readonly categories = computed(() => this.#store.availableCategories());
  readonly isBusy = computed(() => this.#store.isLoading() || this.#store.categoriesLoading());
  readonly isFetchingIncome = computed(() => Boolean(this.incomeId()) && !this.income() && this.isBusy());

  constructor() {
    effect(() => {
      const id = this.incomeId();
      if (id) {
        this.#dispatch.selectIncome({ id });
      }
    });
  }

  onSubmit(changes: Omit<IIncome, 'id'>): void {
    const id = this.incomeId();

    if (!id) {
      return;
    }

    this.#dispatch.update({ id, changes });
    this.#closeDialog();
  }

  onCancel(): void {
    this.#closeDialog();
  }

  #closeDialog(): void {
    void this.#router.navigate(['.'], { relativeTo: this.#route.parent });
  }
}
