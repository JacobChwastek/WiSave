import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IncomeEditFormComponent } from '@features/incomes/components/income-edit-form/income-edit-form.component';
import { incomesPageEvents } from '@features/incomes/store/incomes/incomes.events';
import { IncomesStore } from '@features/incomes/store/incomes/incomes.store';
import { type IIncome } from '@features/incomes/types/incomes.interfaces';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  selector: 'app-add-income',
  imports: [IncomeEditFormComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-secondary-900 dark:text-dark-secondary-50 text-lg font-semibold">Add income</h2>
        <p class="text-secondary-500 dark:text-dark-secondary-300 text-sm">Create a new income and save it.</p>
      </div>

      <app-income-edit-form [income]="null" [categories]="categories()" [isLoading]="isBusy()" (submitted)="onSubmit($event)" (cancelled)="onCancel()" />
    </div>
  `,
})
export class AddIncomeComponent {
  readonly #store = inject(IncomesStore);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #dispatch = injectDispatch(incomesPageEvents);

  readonly categories = computed(() => this.#store.availableCategories());
  readonly isBusy = computed(() => this.#store.isLoading() || this.#store.categoriesLoading());

  onSubmit(income: Omit<IIncome, 'id'>): void {
    this.#dispatch.add({ income });
    this.#closeDialog();
  }

  onCancel(): void {
    this.#closeDialog();
  }

  #closeDialog(): void {
    void this.#router.navigate(['.'], { relativeTo: this.#route.parent });
  }
}
