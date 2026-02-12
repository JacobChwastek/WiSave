import { Component, computed, inject, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';

import { type IIncomeMonthlyStats } from '@features/incomes/types/incomes-state.types';

import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-monthly-income-chart',
  standalone: true,
  imports: [ChartModule, ButtonModule],
  template: `
    <div class="flex h-72 items-center gap-2">
      <p-button [outlined]="true" [rounded]="true" [disabled]="!canGoBack()" [loading]="loading()" (onClick)="onGoBack()" icon="pi pi-chevron-left" size="small" />
      <div class="flex h-full w-full flex-1">
        <p-chart [data]="chartData()" [options]="chartOptions()" class="w-full" type="bar" />
      </div>
      <p-button [outlined]="true" [rounded]="true" [disabled]="!canGoForward()" [loading]="loading()" (onClick)="onGoForward()" icon="pi pi-chevron-right" size="small" />
    </div>
  `,
})
export class MonthlyIncomeChartComponent {
  readonly #theme = inject(ThemeService);

  readonly stats = input.required<IIncomeMonthlyStats[]>();
  readonly loading = input<boolean>(false);
  readonly offset = input<number>(0);
  readonly hasMore = input<boolean>(true);

  readonly navigate = output<'back' | 'forward'>();

  readonly canGoBack = computed(() => this.hasMore());
  readonly canGoForward = computed(() => this.offset() > 0);

  readonly chartData = computed(() => {
    const visible = this.stats();
    const labels = visible.map((item) => this.#formatMonthLabel(item.year, item.month));
    const colors = this.#getColors();

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Recurring',
          backgroundColor: colors.recurring,
          borderColor: colors.recurringBorder,
          data: visible.map((item) => item.recurringTotal),
          stack: 'income',
        },
        {
          type: 'bar',
          label: 'Non-recurring',
          backgroundColor: colors.nonRecurring,
          borderColor: colors.nonRecurringBorder,
          data: visible.map((item) => item.nonRecurringTotal),
          stack: 'income',
        },
      ],
    };
  });

  readonly chartOptions = computed(() => {
    const colors = this.#getColors();

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: {
              size: 12,
              weight: '600',
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: colors.textMuted,
          },
          grid: {
            color: colors.grid,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: colors.textMuted,
          },
          grid: {
            color: colors.grid,
          },
        },
      },
    };
  });

  onGoBack(): void {
    this.navigate.emit('back');
  }

  onGoForward(): void {
    this.navigate.emit('forward');
  }

  #formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
  }

  #getColors() {
    const isDark = this.#theme.isDarkMode();

    return isDark
      ? {
          recurring: 'hsl(215, 45%, 52%)',
          recurringBorder: 'hsl(215, 45%, 44%)',
          nonRecurring: 'hsl(215, 15%, 35%)',
          nonRecurringBorder: 'hsl(215, 15%, 28%)',
          text: 'hsl(210, 15%, 92%)',
          textMuted: 'hsl(210, 12%, 58%)',
          grid: 'hsla(215, 20%, 50%, 0.12)',
        }
      : {
          recurring: 'hsl(215, 50%, 55%)',
          recurringBorder: 'hsl(215, 50%, 48%)',
          nonRecurring: 'hsl(213, 14%, 82%)',
          nonRecurringBorder: 'hsl(213, 14%, 72%)',
          text: 'hsl(220, 30%, 14%)',
          textMuted: 'hsl(215, 14%, 46%)',
          grid: 'hsla(215, 15%, 50%, 0.10)',
        };
  }
}
