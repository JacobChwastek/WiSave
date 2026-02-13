import type { FormArray, FormControl, FormGroup } from '@angular/forms';

import type { Currency } from '@core/types';

export interface MetadataEntryModel {
  key: FormControl<string>;
  value: FormControl<string>;
}

export interface IncomeFormModel {
  date: FormControl<Date | null>;
  description: FormControl<string>;
  category: FormControl<string[]>;
  amount: FormControl<number | null>;
  currency: FormControl<Currency>;
  recurring: FormControl<boolean>;
  metadata: FormArray<FormGroup<MetadataEntryModel>>;
}
