import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-secondary-50 dark:bg-dark-primary-850 border border-secondary-200 dark:border-dark-divider rounded-2xl shadow-sm">
      <header class="border-secondary-100 dark:border-dark-divider border-b px-6 py-4">
        <h3 class="text-secondary-900 dark:text-dark-secondary-50 text-base font-semibold">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="text-secondary-500 dark:text-dark-secondary-400 mt-1 text-sm">{{ subtitle() }}</p>
        }
      </header>
      <div class="px-6 py-4">
        <ng-content />
      </div>
    </section>
  `,
})
export class ChartCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
