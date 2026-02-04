import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Button } from 'primeng/button';
import { Select } from 'primeng/select';

import { IPageInfo, IPageNavigationEvent, IPageSizeChangeEvent } from '@shared/types';

export interface IRowsPerPageOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-cursor-pagination',
  imports: [FormsModule, Button, Select],
  template: `
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="text-secondary-600 dark:text-dark-secondary-300 text-sm">Rows per page:</span>
        <p-select [options]="rowsPerPageOptions()" [ngModel]="rows()" (ngModelChange)="onPageSizeChange($event)" size="small" />
      </div>

      <div class="flex items-center gap-3">
        <span class="text-secondary-600 dark:text-dark-secondary-300 text-sm">{{ paginationInfo() }}</span>

        <div class="flex items-center gap-1">
          <p-button
            [disabled]="!pageInfo().hasPreviousPage || isLoading()"
            [text]="true"
            (click)="onPreviousPage()"
            icon="pi pi-chevron-left"
            severity="secondary"
            size="small"
            ariaLabel="Previous page" />
          <span class="text-secondary-700 dark:text-dark-secondary-200 min-w-12 text-center text-sm font-medium">
            {{ currentPage() }} / {{ totalPages() }}
          </span>
          <p-button
            [disabled]="!pageInfo().hasNextPage || isLoading()"
            [text]="true"
            (click)="onNextPage()"
            icon="pi pi-chevron-right"
            severity="secondary"
            size="small"
            ariaLabel="Next page" />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursorPaginationComponent {
  readonly isLoading = input<boolean>(false);
  readonly rows = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly totalRecords = input.required<number>();
  readonly pageInfo = input.required<IPageInfo>();
  readonly rowsPerPageOptions = input<IRowsPerPageOption[]>([
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ]);

  readonly navigatePage = output<IPageNavigationEvent>();
  readonly pageSizeChange = output<IPageSizeChangeEvent>();

  readonly totalPages = computed(() => Math.ceil(this.totalRecords() / this.rows()));

  readonly paginationInfo = computed(() => {
    const total = this.totalRecords();
    const page = this.currentPage();
    const size = this.rows();
    const start = (page - 1) * size + 1;
    const end = Math.min(page * size, total);
    return `${start}-${end} of ${total}`;
  });

  onPreviousPage(): void {
    this.navigatePage.emit({
      direction: 'previous',
      cursor: this.pageInfo().startCursor,
      pageSize: this.rows(),
    });
  }

  onNextPage(): void {
    this.navigatePage.emit({
      direction: 'next',
      cursor: this.pageInfo().endCursor,
      pageSize: this.rows(),
    });
  }

  onPageSizeChange(rows: number): void {
    this.pageSizeChange.emit({ rows });
  }
}
