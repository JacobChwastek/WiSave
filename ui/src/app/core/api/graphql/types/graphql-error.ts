import type { GraphQLFormattedError } from 'graphql';

export type ErrorCategory = 'validation' | 'auth' | 'not_found' | 'network' | 'server';

const ERROR_CODE_MAP: Record<string, ErrorCategory> = {
  AUTH_NOT_AUTHENTICATED: 'auth',
  AUTH_NOT_AUTHORIZED: 'auth',
  VALIDATION_ERROR: 'validation',
  HC0016: 'validation',
  NOT_FOUND: 'not_found',
};

function resolveCategory(errors: readonly GraphQLFormattedError[]): ErrorCategory {
  for (const error of errors) {
    const code = error.extensions?.['code'] as string | undefined;
    if (code && code in ERROR_CODE_MAP) {
      return ERROR_CODE_MAP[code];
    }
  }
  return 'server';
}

export class GraphQLRequestError extends Error {
  readonly errors: readonly GraphQLFormattedError[];
  readonly category: ErrorCategory;

  constructor(errors: readonly GraphQLFormattedError[], category?: ErrorCategory) {
    const message = errors.map((e) => e.message).join('; ');
    super(message);
    this.name = 'GraphQLRequestError';
    this.errors = errors;
    this.category = category ?? resolveCategory(errors);
  }
}
