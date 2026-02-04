import { Component, computed, inject, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';

import { ThemeService } from '@services/ThemeService';
import { IIncomeMonthlyStats } from '@features/incomes/store/incomes.state';

@Component({
  selector: 'app-monthly-income-chart',
  standalone: true,
  imports: [ChartModule, ButtonModule],
  template: `
    <div class="flex h-72 items-center gap-2">
      <p-button icon="pi pi-chevron-left" [outlined]="true" [rounded]="true" size="small" [disabled]="!canGoBack()" [loading]="loading()" (onClick)="onGoBack()" />
      <div class="flex h-full w-full flex-1">
        <p-chart class="w-full" type="bar" [data]="chartData()" [options]="chartOptions()" />
      </div>
      <p-button icon="pi pi-chevron-right" [outlined]="true" [rounded]="true" size="small" [disabled]="!canGoForward()" [loading]="loading()" (onClick)="onGoForward()" />
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
          recurring: '#b5750a',
          recurringBorder: '#9a6208',
          nonRecurring: '#949fac',
          nonRecurringBorder: '#737e8c',
          text: '#f5f7fa',
          textMuted: '#949fac',
          grid: 'rgba(148, 163, 184, 0.15)',
        }
      : {
          recurring: '#b5750a',
          recurringBorder: '#9a6208',
          nonRecurring: '#b4bcc7',
          nonRecurringBorder: '#8a95a3',
          text: '#283548',
          textMuted: '#4a5568',
          grid: 'rgba(71, 85, 105, 0.12)',
        };
  }
}
