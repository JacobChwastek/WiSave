import { inject, Injectable } from '@angular/core';
import { catchError, map, of, type Observable } from 'rxjs';

import type { ErrorLike, OperationVariables, WatchQueryFetchPolicy } from '@apollo/client/core';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Apollo } from 'apollo-angular';
import type { DocumentNode } from 'graphql';

import { GraphQLRequestError } from '@core/api/graphql';

import type { IGraphQLResult } from '../types/graphql.types';

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  #apollo = inject(Apollo);

  query<TData, TVariables extends OperationVariables = OperationVariables>(document: DocumentNode, variables?: TVariables): Observable<IGraphQLResult<TData>> {
    return this.#apollo.query<TData, TVariables>({ query: document, variables, errorPolicy: 'all', fetchPolicy: 'network-only' } as never).pipe(
      map((result) => this.#toResult<TData>(result.error as ErrorLike | undefined, result.data as TData)),
      catchError((err) => of(this.#networkError<TData>(err))),
    );
  }

  watchQuery<TData, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode,
    variables?: TVariables,
    options?: { fetchPolicy?: WatchQueryFetchPolicy },
  ): Observable<IGraphQLResult<TData>> {
    return this.#apollo.watchQuery<TData, TVariables>({ query: document, variables, errorPolicy: 'all', ...(options ?? {}) } as never).valueChanges.pipe(
      map((result) => this.#toResult<TData>(result.error as ErrorLike | undefined, result.data as TData)),
      catchError((err) => of(this.#networkError<TData>(err))),
    );
  }

  mutate<TData, TVariables extends OperationVariables = OperationVariables>(document: DocumentNode, variables?: TVariables): Observable<IGraphQLResult<TData>> {
    return this.#apollo.mutate<TData, TVariables>({ mutation: document, variables, errorPolicy: 'all' } as never).pipe(
      map((result) => this.#toResult<TData>(result.error as ErrorLike | undefined, (result.data ?? undefined) as TData)),
      catchError((err) => of(this.#networkError<TData>(err))),
    );
  }

  #toResult<TData>(error: ErrorLike | undefined, data: TData): IGraphQLResult<TData> {
    if (CombinedGraphQLErrors.is(error)) {
      return { data, error: new GraphQLRequestError(error.errors) };
    }
    if (error) {
      return { data, error: new GraphQLRequestError([{ message: error.message }], 'network') };
    }
    return { data, error: null };
  }

  #networkError<TData>(err: unknown): IGraphQLResult<TData> {
    const message = err instanceof Error ? err.message : 'Network error';
    return { data: undefined as TData, error: new GraphQLRequestError([{ message }], 'network') };
  }
}
