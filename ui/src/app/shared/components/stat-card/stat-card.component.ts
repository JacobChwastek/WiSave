import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { ChangePercentPipe } from '@shared/pipes/change-percent.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, ChangePercentPipe],
  template: `
    <div [class.stat-card--standalone]="appearance() === 'standalone'" class="stat-card">
      <div class="flex items-center justify-between gap-3">
        <p class="stat-card__label">
          {{ title() }}
        </p>
        @let changeInfo = change() | changePercent;
        @if (showChange() && changeInfo.value) {
          <span [class.stat-card__change--positive]="changeInfo.isPositive === true" [class.stat-card__change--negative]="changeInfo.isPositive === false" class="stat-card__change">
            {{ changeInfo.sign }}{{ changeInfo.value }}%
          </span>
        }
      </div>
      <div class="stat-card__value">
        {{ value() }}
      </div>
      @if (description()) {
        <p class="stat-card__description">
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
}
