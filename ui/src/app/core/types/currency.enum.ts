export enum Currency {
  PLN = 'PLN',
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF',
}

export const CurrencySymbol: Record<Currency, string> = {
  [Currency.PLN]: 'zł',
  [Currency.EUR]: '€',
  [Currency.USD]: '$',
  [Currency.GBP]: '£',
  [Currency.CHF]: 'Fr',
};

export const CurrencyLocale: Record<Currency, string> = {
  [Currency.PLN]: 'pl-PL',
  [Currency.EUR]: 'de-DE',
  [Currency.USD]: 'en-US',
  [Currency.GBP]: 'en-GB',
  [Currency.CHF]: 'de-CH',
};
