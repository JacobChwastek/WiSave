import type { GraphQLFormattedError } from 'graphql';

export class GraphQLRequestError extends Error {
  readonly errors: readonly GraphQLFormattedError[];

  constructor(errors: readonly GraphQLFormattedError[]) {
    const message = errors.map((e) => e.message).join('; ');
    super(message);
    this.name = 'GraphQLRequestError';
    this.errors = errors;
  }
}
