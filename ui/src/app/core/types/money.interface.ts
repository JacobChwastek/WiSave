import { Currency, CurrencyLocale } from './currency.enum';

export interface IMoney {
  amount: number;
  currency: Currency;
}

export function formatMoney(money: IMoney): string {
  return new Intl.NumberFormat(CurrencyLocale[money.currency], {
    style: 'currency',
    currency: money.currency,
  }).format(money.amount);
}

export function createMoney(amount: number, currency: Currency = Currency.PLN): IMoney {
  return { amount, currency };
}
