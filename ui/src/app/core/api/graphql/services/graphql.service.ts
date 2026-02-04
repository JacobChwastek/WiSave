import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { OperationVariables } from '@apollo/client/core';
import type { DocumentNode } from 'graphql';
import { Apollo } from 'apollo-angular';

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  #apollo = inject(Apollo);

  query<TData, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode,
    variables?: TVariables,
  ): Observable<TData> {
    return this.#apollo.query<TData, TVariables>({ query: document, variables } as never).pipe(map((result) => result.data as TData));
  }

  watchQuery<TData, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode,
    variables?: TVariables,
  ): Observable<TData> {
    return this.#apollo
      .watchQuery<TData, TVariables>({ query: document, variables } as never)
      .valueChanges.pipe(map((result) => result.data as TData));
  }

  mutate<TData, TVariables extends OperationVariables = OperationVariables>(
    document: DocumentNode,
    variables?: TVariables,
  ): Observable<TData | null | undefined> {
    return this.#apollo.mutate<TData, TVariables>({ mutation: document, variables } as never).pipe(map((result) => result.data));
  }
}
