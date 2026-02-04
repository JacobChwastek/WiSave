import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { ChartModule } from 'primeng/chart';

import { IIncomeMonthlyStats } from '@features/incomes/store/incomes.state';

@Component({
  selector: 'app-monthly-income-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="h-72">
      <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" />
    </div>
  `,
})
export class MonthlyIncomeChartComponent {
  readonly stats = input.required<IIncomeMonthlyStats[]>();

  readonly chartData = computed(() => {
    const labels = this.stats().map((item) => this.#formatMonthLabel(item.year, item.month));
    const colors = this.#getColors();

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Recurring',
          backgroundColor: colors.recurring,
          borderColor: colors.recurringBorder,
          data: this.stats().map((item) => item.recurringTotal),
          stack: 'income',
        },
        {
          type: 'bar',
          label: 'Non-recurring',
          backgroundColor: colors.nonRecurring,
          borderColor: colors.nonRecurringBorder,
          data: this.stats().map((item) => item.nonRecurringTotal),
          stack: 'income',
        },
        {
          type: 'line',
          label: 'Total',
          borderColor: colors.total,
          backgroundColor: colors.total,
          data: this.stats().map((item) => item.total),
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: colors.total,
          yAxisID: 'y',
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

  #formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  }

  #getColors() {
    const root = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.classList.contains('dark');

    return {
      recurring: root.getPropertyValue('--color-accent-500').trim() || '#f59e0b',
      recurringBorder: root.getPropertyValue('--color-accent-600').trim() || '#d97706',
      nonRecurring: root.getPropertyValue('--color-secondary-300').trim() || '#94a3b8',
      nonRecurringBorder: root.getPropertyValue('--color-secondary-400').trim() || '#64748b',
      total: root.getPropertyValue('--color-primary-600').trim() || '#f59e0b',
      text: isDark ? root.getPropertyValue('--color-dark-secondary-50').trim() : root.getPropertyValue('--color-secondary-900').trim(),
      textMuted: isDark ? root.getPropertyValue('--color-dark-secondary-300').trim() : root.getPropertyValue('--color-secondary-500').trim(),
      grid: isDark ? root.getPropertyValue('--color-dark-divider').trim() : root.getPropertyValue('--color-divider').trim(),
    };
  }
}
