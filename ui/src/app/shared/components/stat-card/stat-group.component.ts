import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { type IStatItem } from '@shared/types';

import { StatCardComponent } from './stat-card.component';

@Component({
  selector: 'app-stat-group',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  template: `
    <div
      class="bg-secondary-50 dark:bg-dark-primary-850 border border-secondary-200 dark:border-dark-divider overflow-hidden rounded-2xl shadow-sm">
      <div
        class="divide-secondary-200 dark:divide-dark-divider grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x xl:grid-cols-5">
        @for (item of items(); track item.title) {
          <app-stat-card
            [title]="item.title"
            [value]="item.value"
            [description]="item.description ?? null"
            [change]="item.change ?? null"
            [showChange]="item.showChange ?? true"
            appearance="grouped" />
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class StatGroupComponent {
  readonly items = input.required<IStatItem[]>();
}
