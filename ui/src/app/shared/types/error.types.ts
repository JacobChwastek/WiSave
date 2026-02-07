import type { ErrorCategory } from '@core/api/graphql';

export type { ErrorCategory } from '@core/api/graphql';

export interface IStoreError {
  message: string;
  category: ErrorCategory;
}
