export type IncomeId = string & { readonly __brand: 'IncomeId' };

export const asIncomeId = (value: string): IncomeId => value as IncomeId;
