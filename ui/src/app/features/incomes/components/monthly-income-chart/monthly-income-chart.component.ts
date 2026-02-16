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
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-center gap-2">
        <p-button [outlined]="true" [rounded]="true" [disabled]="!canGoBack()" [loading]="loading()" (onClick)="onGoBack()" icon="pi pi-chevron-left" size="small" severity="success" />
        <span class="min-w-16 text-center font-semibold">{{ year() }}</span>
        <p-button [outlined]="true" [rounded]="true" [disabled]="!canGoForward()" [loading]="loading()" (onClick)="onGoForward()" icon="pi pi-chevron-right" size="small" severity="success" />
      </div>
      <div class="h-72 flex w-full">
        <p-chart [data]="chartData()" [options]="chartOptions()" [plugins]="chartPlugins" class="w-full" type="bar" />
      </div>
    </div>
  `,
})
export class MonthlyIncomeChartComponent {
  readonly #theme = inject(ThemeService);

  readonly stats = input.required<IIncomeMonthlyStats[]>();
  readonly loading = input<boolean>(false);
  readonly year = input.required<number>();

  readonly navigate = output<'back' | 'forward'>();

  readonly canGoBack = computed(() => true);
  readonly canGoForward = computed(() => this.year() < new Date().getFullYear());

  readonly chartData = computed(() => {
    const visible = this.stats();
    const labels = visible.map((item) => this.#formatMonthLabel(item.year, item.month));
    const colors = this.#getColors();

    const hasData = visible.some((item) => item.recurringTotal + item.nonRecurringTotal > 0);

    const datasets: unknown[] = [
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
    ];

    if (hasData) {
      datasets.push({
        type: 'line',
        label: 'Average',
        borderColor: colors.average,
        backgroundColor: colors.average,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        data: visible.map(() => 0),
      });
    }

    return { labels, datasets };
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
        tooltip: {
          callbacks: {
            label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
              const label = context.dataset.label ?? '';
              const value = context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return `${label}: ${value}`;
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

  readonly chartPlugins = [
    {
      id: 'averageLine',
      beforeUpdate: (chart: { data: { datasets: { label?: string; data: number[] }[] }; isDatasetVisible: (i: number) => boolean }) => {
        const avgIndex = chart.data.datasets.findIndex((ds) => ds.label === 'Average');
        if (avgIndex === -1) return;

        const barDatasets = chart.data.datasets.filter((ds, i) => ds.label !== 'Average' && chart.isDatasetVisible(i));
        const monthCount = chart.data.datasets[0]?.data.length ?? 0;
        const totals: number[] = [];

        for (let m = 0; m < monthCount; m++) {
          const sum = barDatasets.reduce((acc, ds) => acc + (ds.data[m] ?? 0), 0);
          if (sum > 0) totals.push(sum);
        }

        const avg = totals.length >= 2 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
        chart.data.datasets[avgIndex].data = chart.data.datasets[avgIndex].data.map(() => avg);
      },
      afterDatasetsDraw: (chart: { data: { datasets: { label?: string; borderColor?: string; data: number[] }[] }; isDatasetVisible: (i: number) => boolean; scales: Record<string, { getPixelForValue: (v: number) => number }>; chartArea: { right: number }; ctx: CanvasRenderingContext2D }) => {
        const avgIndex = chart.data.datasets.findIndex((ds) => ds.label === 'Average');
        if (avgIndex === -1 || !chart.isDatasetVisible(avgIndex)) return;

        const avgDataset = chart.data.datasets[avgIndex];
        const value = avgDataset.data[0];
        if (!value) return;

        const y = chart.scales['y'].getPixelForValue(value);
        const ctx = chart.ctx;
        const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        ctx.save();
        ctx.font = '600 11px sans-serif';
        ctx.fillStyle = avgDataset.borderColor ?? '';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatted, chart.chartArea.right, y - 4);
        ctx.restore();
      },
    },
  ];

  onGoBack(): void {
    this.navigate.emit('back');
  }

  onGoForward(): void {
    this.navigate.emit('forward');
  }

  #formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  }

  #getColors() {
    const isDark = this.#theme.isDarkMode();

    return isDark
      ? {
          recurring: 'hsl(215, 45%, 52%)',
          recurringBorder: 'hsl(215, 45%, 44%)',
          nonRecurring: 'hsl(215, 15%, 35%)',
          nonRecurringBorder: 'hsl(215, 15%, 28%)',
          average: 'hsl(38, 80%, 52%)',
          text: 'hsl(210, 15%, 92%)',
          textMuted: 'hsl(210, 12%, 58%)',
          grid: 'hsla(215, 20%, 50%, 0.12)',
        }
      : {
          recurring: 'hsl(215, 50%, 55%)',
          recurringBorder: 'hsl(215, 50%, 48%)',
          nonRecurring: 'hsl(213, 14%, 82%)',
          nonRecurringBorder: 'hsl(213, 14%, 72%)',
          average: 'hsl(36, 90%, 45%)',
          text: 'hsl(220, 30%, 14%)',
          textMuted: 'hsl(215, 14%, 46%)',
          grid: 'hsla(215, 15%, 50%, 0.10)',
        };
  }
}
