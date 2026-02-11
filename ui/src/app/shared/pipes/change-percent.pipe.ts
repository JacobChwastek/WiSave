import { Pipe, type PipeTransform } from '@angular/core';

export interface IChangePercent {
  sign: '+' | '-' | '';
  value: string | null;
  isPositive: boolean | null;
}

@Pipe({
  name: 'changePercent',
  standalone: true,
})
export class ChangePercentPipe implements PipeTransform {
  transform(change: number | null | undefined): IChangePercent {
    if (change === null || change === undefined) {
      return { sign: '', value: null, isPositive: null };
    }

    const absolute = Math.abs(change);
    const value = Number.isInteger(absolute) ? absolute.toFixed(0) : absolute.toFixed(2);

    if (change > 0) {
      return { sign: '+', value, isPositive: true };
    }

    if (change < 0) {
      return { sign: '-', value, isPositive: false };
    }

    return { sign: '', value, isPositive: null };
  }
}
