import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { ErrorLike, OperationVariables } from '@apollo/client/core';
import type { DocumentNode } from 'graphql';
import { Apollo } from 'apollo-angular';

import { GraphQLRequestError } from '@core/api/graphql';

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  #apollo = inject(Apollo);

  query<TData, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode,
    variables?: TVariables,
  ): Observable<TData> {
    return this.#apollo
      .query<TData, TVariables>({ query: document, variables, errorPolicy: 'all', fetchPolicy: 'network-only' } as never)
      .pipe(map((result) => this.#throwIfError(result.error, result.data as TData)));
  }

  watchQuery<TData, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode,
    variables?: TVariables,
  ): Observable<TData> {
    return this.#apollo
      .watchQuery<TData, TVariables>({ query: document, variables, errorPolicy: 'all' } as never)
      .valueChanges.pipe(map((result) => this.#throwIfError(result.error, result.data as TData)));
  }

  mutate<TData, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode,
    variables?: TVariables,
  ): Observable<TData | null | undefined> {
    return this.#apollo
      .mutate<TData, TVariables>({ mutation: document, variables, errorPolicy: 'all' } as never)
      .pipe(map((result) => this.#throwIfError(result.error, result.data)));
  }

  #throwIfError<TData>(error: ErrorLike | undefined, data: TData): TData {
    if (error) {
      throw new GraphQLRequestError([{ message: error.message }]);
    }

    return data;
  }
}
