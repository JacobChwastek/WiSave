import { GraphQLRequestError } from '@core/api/graphql';
import { type IStoreError } from '@shared/types';

export const toStoreError = (err: unknown): IStoreError => {
  if (err instanceof GraphQLRequestError) {
    return { message: err.message, category: err.category };
  }
  return { message: err instanceof Error ? err.message : 'Unknown error', category: 'server' };
};
