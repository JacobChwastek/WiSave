import { Injectable } from '@angular/core';

import { Currency } from '@core/types/currency.enum';
import { IMoney } from '@core/types/money.interface';

import type { IncomeFieldsFragment } from '../graphql/income.fragment.generated';
import type { IIncome } from '../types/incomes.interfaces';

@Injectable({ providedIn: 'root' })
export class IncomesMapperService {
  mapToIncome(document: IncomeFieldsFragment): IIncome {
    return {
      id: document.id,
      date: new Date(document.date),
      description: document.description,
      category: document.categories,
      amount: this.#mapToMoney(document.amount, document.currency),
      recurring: document.recurring || undefined,
    };
  }

  mapToIncomes(documents: IncomeFieldsFragment[]): IIncome[] {
    return documents.map((doc) => this.mapToIncome(doc));
  }

  #mapToMoney(amount: number, currency: string): IMoney {
    return {
      amount,
      currency: this.#mapToCurrency(currency),
    };
  }

  #mapToCurrency(currency: string): Currency {
    const currencyMap: Record<string, Currency> = {
      PLN: Currency.PLN,
      EUR: Currency.EUR,
      USD: Currency.USD,
      GBP: Currency.GBP,
      CHF: Currency.CHF,
    };

    return currencyMap[currency] ?? Currency.PLN;
  }
}
