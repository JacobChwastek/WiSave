import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isNewIncome',
  pure: true,
})
export class IsNewIncomePipe implements PipeTransform {
  transform(incomeId: string, newIncomeId: string | null): boolean {
    return newIncomeId !== null && incomeId === newIncomeId;
  }
}
