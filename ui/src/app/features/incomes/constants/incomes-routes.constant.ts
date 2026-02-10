export const INCOMES_ROUTES = {
  ADD: 'add',
  IMPORT: 'import',
  EDIT: 'edit',
} as const;

export type IncomeRoute = (typeof INCOMES_ROUTES)[keyof typeof INCOMES_ROUTES];
