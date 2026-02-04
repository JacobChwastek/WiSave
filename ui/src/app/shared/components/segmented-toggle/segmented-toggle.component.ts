import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface ISegmentedToggleOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-segmented-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-secondary-200 dark:border-dark-divider bg-secondary-50 dark:bg-dark-primary-850 inline-flex rounded-full border p-1">
      @for (option of options(); track option.value) {
        <button type="button" [class]="buttonClass(option.value)" (click)="onSelect(option.value)">
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class SegmentedToggleComponent {
  readonly options = input.required<ISegmentedToggleOption[]>();
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  onSelect(value: string): void {
    if (this.value() === value) {
      return;
    }

    this.valueChange.emit(value);
  }

  buttonClass(value: string): string {
    const isActive = this.value() === value;

    return isActive
      ? 'bg-accent-500 hover:bg-accent-600 text-secondary-50 dark:text-dark-primary-950 rounded-full px-3 py-1 text-xs font-semibold shadow-sm'
      : 'text-secondary-600 dark:text-dark-secondary-300 hover:text-secondary-800 dark:hover:text-dark-secondary-100 rounded-full px-3 py-1 text-xs font-semibold transition';
  }
}
