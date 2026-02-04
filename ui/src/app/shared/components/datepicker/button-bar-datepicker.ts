import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-button-bar-datepicker',
  imports: [DatePicker, Button, FormsModule],
  template: ` <div class="card flex flex-wrap justify-center gap-4">
    <p-datepicker [(ngModel)]="dates" [showButtonBar]="true" [readonlyInput]="true" [showIcon]="true" (onClose)="onClose()" selectionMode="range">
      <ng-template #buttonbar let-todayCallback="todayCallback" let-clearCallback="clearCallback">
        <div class="flex w-full flex-1 flex-row justify-between">
          <div class="flex gap-2">
            <p-button (click)="onLastMonthSelected()" size="small" label="Last month" severity="secondary" />
            <p-button (click)="onThisMonthSelected()" size="small" label="This month" severity="secondary" />
          </div>
          <div class="flex gap-2">
            <p-button (click)="todayCallback($event)" size="small" label="Today" variant="outlined" />
            <p-button (click)="clearCallback($event)" size="small" icon="pi pi-times" severity="danger" variant="text" />
          </div>
        </div>
      </ng-template>
    </p-datepicker>
  </div>`,
})
export class ButtonBarDatepickerComponent {
  datesChanged = output<Date[]>();

  dates: Date[] = [];

  onLastMonthSelected() {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    this.dates = [firstDayLastMonth, lastDayLastMonth];
    this.datesChanged.emit(this.dates);
  }

  onThisMonthSelected() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.dates = [firstDayThisMonth, lastDayThisMonth];
    this.datesChanged.emit(this.dates);
  }

  onClose() {
    if (this.dates.length > 0) {
      this.datesChanged.emit(this.dates);
    }
  }
}
