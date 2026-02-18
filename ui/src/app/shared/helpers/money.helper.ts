import { createMoney, Currency, formatMoney } from '@core/types';

export function formatAmount(amount: number, currency: Currency = Currency.PLN): string {
  return formatMoney(createMoney(amount, currency));
}
