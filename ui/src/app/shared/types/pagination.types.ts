export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export type CursorDirection = 'next' | 'previous' | 'first';

export interface ICursorPaginationRequest {
  direction: CursorDirection;
  cursor: string | null;
  pageSize: number;
}

export interface IPagination {
  rows: number;
  currentPage: number;
  totalRecords: number;
  pageInfo: IPageInfo;
}

export const initialPageInfo: IPageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

export const initialPagination: IPagination = {
  rows: 10,
  currentPage: 1,
  totalRecords: 0,
  pageInfo: initialPageInfo,
};

export interface IPageNavigationEvent {
  direction: CursorDirection;
  cursor: string | null;
  pageSize: number;
}

export interface IPageSizeChangeEvent {
  rows: number;
}
