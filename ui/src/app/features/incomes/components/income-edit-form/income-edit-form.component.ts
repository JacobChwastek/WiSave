import { Component, computed, effect, input, output } from '@angular/core';
import { type AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, type ValidationErrors, Validators } from '@angular/forms';

import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { type IIncome } from '@features/incomes/types/incomes.interfaces';
import { type IncomeFormModel, type MetadataEntryModel } from '@features/incomes/types/income-edit-form.types';

import { createMoney, Currency, CurrencySymbol } from '@core/types';

const DEFAULT_CURRENCY = Currency.PLN;

const CURRENCY_OPTIONS: { label: string; value: Currency }[] = (Object.values(Currency) as Currency[]).map((currency) => ({
  label: `${currency} (${CurrencySymbol[currency]})`,
  value: currency,
}));

const INITIAL_FORM_VALUE = {
  date: null as Date | null,
  description: '',
  category: [] as string[],
  amount: null as number | null,
  currency: DEFAULT_CURRENCY,
  recurring: false,
};

const trimmedRequired = (control: AbstractControl): ValidationErrors | null => {
  const { value } = control;
  return typeof value === 'string' && value.trim().length > 0 ? null : { required: true };
};

@Component({
  selector: 'app-income-edit-form',
  imports: [ReactiveFormsModule, Button, DatePicker, InputNumber, InputText, MultiSelect, Select, ToggleSwitch],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium" for="income-date">Date</label>
          <p-datepicker
            [attr.aria-describedby]="isInvalid('date') ? 'income-date-error' : null"
            [showIcon]="true"
            [showButtonBar]="true"
            [readonlyInput]="true"
            [fluid]="true"
            inputStyleClass="!py-[0.625rem]"
            inputId="income-date"
            formControlName="date"
            appendTo="body" />
          @if (isInvalid('date')) {
            <span id="income-date-error" class="text-danger-600 dark:text-danger-400 text-xs">Date is required.</span>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium" for="income-description">Description</label>
          <input
            id="income-description"
            [attr.aria-describedby]="isInvalid('description') ? 'income-description-error' : null"
            class="w-full"
            pInputText
            type="text"
            formControlName="description"
            placeholder="Salary, bonus, rent" />
          @if (isInvalid('description')) {
            <span id="income-description-error" class="text-danger-600 dark:text-danger-400 text-xs">Description is required.</span>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium" for="income-category">Categories</label>
          <p-multiSelect
            [options]="categoryOptions()"
            [showClear]="true"
            class="w-full"
            inputId="income-category"
            formControlName="category"
            optionLabel="label"
            optionValue="value"
            display="chip"
            appendTo="body"
            placeholder="Select categories" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium" for="income-amount">Amount</label>
          <p-inputNumber
            [attr.aria-describedby]="isInvalid('amount') ? 'income-amount-error' : null"
            [min]="0.01"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
            class="w-full"
            inputId="income-amount"
            formControlName="amount"
            mode="decimal"
            placeholder="0.00" />
          @if (isInvalid('amount')) {
            <span id="income-amount-error" class="text-danger-600 dark:text-danger-400 text-xs">Amount is required and must be greater than 0.</span>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium" for="income-currency">Currency</label>
          <p-select
            [attr.aria-describedby]="isInvalid('currency') ? 'income-currency-error' : null"
            [options]="currencyOptions"
            class="w-full"
            inputId="income-currency"
            formControlName="currency"
            optionLabel="label"
            optionValue="value"
            appendTo="body"
            placeholder="Select currency" />
          @if (isInvalid('currency')) {
            <span id="income-currency-error" class="text-danger-600 dark:text-danger-400 text-xs">Currency is required.</span>
          }
        </div>

        <div class="border-secondary-200 dark:border-dark-divider flex items-center justify-between gap-4 rounded-xl border p-3">
          <div class="flex flex-col">
            <label class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium" for="income-recurring">Recurring</label>
            <span class="text-secondary-500 dark:text-dark-secondary-300 text-xs">Mark if this income repeats.</span>
          </div>
          <p-toggleswitch inputId="income-recurring" formControlName="recurring" />
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-secondary-700 dark:text-dark-secondary-100 text-sm font-medium">Metadata</span>
            <span class="text-secondary-500 dark:text-dark-secondary-300 text-xs">Add custom key-value data (optional).</span>
          </div>
          <p-button
            [disabled]="isLoading()"
            (click)="addMetadataEntry()"
            type="button"
            label="Add field"
            icon="pi pi-plus"
            severity="secondary"
            size="small"
            [text]="true" />
        </div>
        @for (entry of form.controls.metadata.controls; track entry; let i = $index) {
          <div class="flex items-start gap-2">
            <div class="flex flex-1 flex-col gap-1">
              <input
                [formControl]="entry.controls.key"
                class="w-full"
                pInputText
                type="text"
                placeholder="Key (e.g. tax)" />
              @if (entry.controls.key.invalid && (entry.controls.key.dirty || entry.controls.key.touched)) {
                <span class="text-danger-600 dark:text-danger-400 text-xs">Key is required.</span>
              }
            </div>
            <div class="flex flex-1 flex-col gap-1">
              <input
                [formControl]="entry.controls.value"
                class="w-full"
                pInputText
                type="text"
                placeholder="Value (e.g. 19%)" />
              @if (entry.controls.value.invalid && (entry.controls.value.dirty || entry.controls.value.touched)) {
                <span class="text-danger-600 dark:text-danger-400 text-xs">Value is required.</span>
              }
            </div>
            <p-button
              [disabled]="isLoading()"
              (click)="removeMetadataEntry(i)"
              type="button"
              icon="pi pi-trash"
              severity="danger"
              size="small"
              [text]="true"
              [rounded]="true" />
          </div>
        }
      </div>

      <div class="border-secondary-200 dark:border-dark-divider flex items-center justify-end gap-2 pt-4">
        <p-button [disabled]="isLoading()" (click)="onCancel()" type="button" label="Cancel" icon="pi pi-times" severity="secondary" size="small" />
        <p-button [loading]="isLoading()" [disabled]="form.invalid || isLoading()" type="submit" label="Save" icon="pi pi-check" severity="success" size="small" />
      </div>
    </form>
  `,
})
export class IncomeEditFormComponent {
  readonly income = input<IIncome | null>(null);
  readonly categories = input<string[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly submitted = output<Omit<IIncome, 'id'>>();
  readonly cancelled = output<void>();

  readonly currencyOptions = CURRENCY_OPTIONS;

  readonly categoryOptions = computed(() => this.categories().map((category) => ({ label: category, value: category })));

  readonly form = new FormGroup<IncomeFormModel>({
    date: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<string[]>([], { nonNullable: true }),
    amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    currency: new FormControl<Currency>(DEFAULT_CURRENCY, { nonNullable: true, validators: [Validators.required] }),
    recurring: new FormControl(false, { nonNullable: true }),
    metadata: new FormArray<FormGroup<MetadataEntryModel>>([]),
  });

  constructor() {
    effect(() => {
      const income = this.income();

      if (!income) {
        this.form.reset(INITIAL_FORM_VALUE, { emitEvent: false });
        this.#clearMetadata();
        this.form.markAsPristine();
        this.form.markAsUntouched();
        return;
      }

      this.form.reset(
        {
          date: income.date,
          description: income.description,
          category: income.category ?? [],
          amount: income.amount.amount,
          currency: income.amount.currency,
          recurring: income.recurring ?? false,
        },
        { emitEvent: false },
      );
      this.#clearMetadata();
      if (income.metadata) {
        for (const [key, value] of Object.entries(income.metadata)) {
          this.addMetadataEntry(key, value);
        }
      }
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });

    effect(() => {
      if (this.isLoading()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (!value.date || value.amount === null || value.amount <= 0) {
      return;
    }

    const metadata: Record<string, string> = {};
    for (const entry of this.form.controls.metadata.controls) {
      const key = entry.controls.key.value.trim();
      const val = entry.controls.value.value.trim();
      if (key && val) {
        metadata[key] = val;
      }
    }

    this.submitted.emit({
      date: value.date,
      description: value.description.trim(),
      category: value.category,
      amount: createMoney(value.amount, value.currency),
      recurring: value.recurring,
      ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  addMetadataEntry(key = '', value = ''): void {
    this.form.controls.metadata.push(
      new FormGroup<MetadataEntryModel>({
        key: new FormControl(key, { nonNullable: true, validators: [trimmedRequired] }),
        value: new FormControl(value, { nonNullable: true, validators: [trimmedRequired] }),
      }),
    );
  }

  removeMetadataEntry(index: number): void {
    this.form.controls.metadata.removeAt(index);
  }

  isInvalid(controlName: keyof IncomeFormModel): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  #clearMetadata(): void {
    this.form.controls.metadata.clear();
  }
}
