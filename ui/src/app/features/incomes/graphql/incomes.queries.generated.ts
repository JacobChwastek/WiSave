/* eslint-disable */
import * as Types from '@graphql/generated/schema.types';

import { gql } from 'apollo-angular';
import { IncomeFieldsFragmentDoc } from './income.fragment.generated';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetIncomesQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  where?: Types.InputMaybe<Types.IncomeDocumentFilterInput>;
  order?: Types.InputMaybe<Array<Types.IncomeDocumentSortInput> | Types.IncomeDocumentSortInput>;
}>;


export type GetIncomesQuery = { __typename?: 'Query', incomes?: { __typename?: 'IncomesConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'IncomeDocument', id: string, date: string, description: string, categories: Array<string>, amount: number, currency: string, recurring: boolean, createdAt: string, updatedAt?: string | null }> | null } | null };

export type GetIncomeByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type GetIncomeByIdQuery = { __typename?: 'Query', incomeById?: { __typename?: 'IncomeDocument', id: string, date: string, description: string, categories: Array<string>, amount: number, currency: string, recurring: boolean, createdAt: string, updatedAt?: string | null } | null };

export type GetTotalAmountQueryVariables = Types.Exact<{
  currency?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetTotalAmountQuery = { __typename?: 'Query', totalAmount: number };

export type GetCategoriesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: Array<string> };

export type GetIncomeStatsQueryVariables = Types.Exact<{
  includeNonRecurring: Types.Scalars['Boolean']['input'];
}>;


export type GetIncomeStatsQuery = { __typename?: 'Query', incomeStats: { __typename?: 'IncomeStats', lastYearTotal: number, thisYearTotal: number, thisMonthTotal: number, last3MonthsAverage: number, lastYearMonthlyAverage: number } };

export type GetIncomeMonthlyStatsQueryVariables = Types.Exact<{
  year: Types.Scalars['Int']['input'];
}>;


export type GetIncomeMonthlyStatsQuery = { __typename?: 'Query', incomeMonthlyStats: Array<{ __typename?: 'MonthlyIncomeStats', year: number, month: number, recurringTotal: number, nonRecurringTotal: number }> };

export const GetIncomesDocument = gql`
    query GetIncomes($first: Int, $after: String, $last: Int, $before: String, $where: IncomeDocumentFilterInput, $order: [IncomeDocumentSortInput!]) {
  incomes(
    first: $first
    after: $after
    last: $last
    before: $before
    where: $where
    order: $order
  ) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    nodes {
      ...IncomeFields
    }
    totalCount
  }
}
    ${IncomeFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetIncomesGQL extends Apollo.Query<GetIncomesQuery, GetIncomesQueryVariables> {
    override document = GetIncomesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetIncomeByIdDocument = gql`
    query GetIncomeById($id: String!) {
  incomeById(id: $id) {
    ...IncomeFields
  }
}
    ${IncomeFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetIncomeByIdGQL extends Apollo.Query<GetIncomeByIdQuery, GetIncomeByIdQueryVariables> {
    override document = GetIncomeByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetTotalAmountDocument = gql`
    query GetTotalAmount($currency: String) {
  totalAmount(currency: $currency)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetTotalAmountGQL extends Apollo.Query<GetTotalAmountQuery, GetTotalAmountQueryVariables> {
    override document = GetTotalAmountDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetCategoriesDocument = gql`
    query GetCategories {
  categories
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetCategoriesGQL extends Apollo.Query<GetCategoriesQuery, GetCategoriesQueryVariables> {
    override document = GetCategoriesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetIncomeStatsDocument = gql`
    query GetIncomeStats($includeNonRecurring: Boolean!) {
  incomeStats(includeNonRecurring: $includeNonRecurring) {
    lastYearTotal
    thisYearTotal
    thisMonthTotal
    last3MonthsAverage
    lastYearMonthlyAverage
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetIncomeStatsGQL extends Apollo.Query<GetIncomeStatsQuery, GetIncomeStatsQueryVariables> {
    override document = GetIncomeStatsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetIncomeMonthlyStatsDocument = gql`
    query GetIncomeMonthlyStats($year: Int!) {
  incomeMonthlyStats(year: $year) {
    year
    month
    recurringTotal
    nonRecurringTotal
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetIncomeMonthlyStatsGQL extends Apollo.Query<GetIncomeMonthlyStatsQuery, GetIncomeMonthlyStatsQueryVariables> {
    override document = GetIncomeMonthlyStatsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }