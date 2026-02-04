export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface IEdge<T> {
  cursor: string;
  node: T;
}

export interface IConnection<T> {
  pageInfo: IPageInfo;
  edges: IEdge<T>[] | null;
  nodes: T[] | null;
  totalCount: number;
}

export interface IPaginationVariables {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}
