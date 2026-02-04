import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { ChangePercentPipe } from '@shared/pipes/change-percent.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, ChangePercentPipe],
  template: `
    <div [class]="cardClass()">
      <div class="flex items-center justify-between gap-3">
        <p class="text-secondary-600 dark:text-dark-secondary-300 text-sm font-medium tracking-wide">
          {{ title() }}
        </p>
        @let changeInfo = change() | changePercent;
        @if (showChange() && changeInfo.value) {
          <span [class]="changeClass(changeInfo.isPositive)">{{ changeInfo.sign }}{{ changeInfo.value }}%</span>
        }
      </div>
      <div class="text-secondary-900 dark:text-dark-secondary-50 mt-3 text-3xl font-semibold tracking-tight">
        {{ value() }}
      </div>
      @if (description()) {
        <p class="text-secondary-500 dark:text-dark-secondary-400 mt-2 text-sm">
          {{ description() }}
        </p>
      }
    </div>
  `,
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly description = input<string | null>(null);
  readonly change = input<number | null>(null);
  readonly showChange = input<boolean>(true);
  readonly appearance = input<'standalone' | 'grouped'>('standalone');

  changeClass(isPositive: boolean | null): string {
    if (isPositive === true) {
      return 'text-emerald-600 dark:text-emerald-400 text-xs font-semibold';
    }

    if (isPositive === false) {
      return 'text-rose-600 dark:text-rose-400 text-xs font-semibold';
    }

    return 'text-secondary-500 dark:text-dark-secondary-400 text-xs font-semibold';
  }

  readonly cardClass = computed(() => {
    if (this.appearance() === 'grouped') {
      return 'px-6 py-5';
    }

    return 'bg-secondary-50 dark:bg-dark-primary-850 border border-secondary-200 dark:border-dark-divider rounded-2xl px-6 py-5 shadow-sm';
  });
}
