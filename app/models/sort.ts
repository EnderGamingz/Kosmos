export enum SortOrder {
  Asc,
  Desc,
}

export function getSortOrderString(sortOrder?: SortOrder): string | undefined {
  switch (sortOrder) {
    case SortOrder.Asc:
      return 'Asc';
    case SortOrder.Desc:
      return 'Desc';
    default:
      return undefined;
  }
}

export type SortParams = {
  sort_order?: SortOrder;
  sort_by?: SortBy;
  limit?: number;
  offset?: number;
  album_files?: boolean;
};

export type SortParamsForQuery = {
  sort_order?: string;
  sort_by?: string;
  limit?: number;
  offset?: number;
};

export enum SortBy {
  Name,
  FileSize,
  CreatedAt,
  UpdatedAt,
}

export function canFolderBeSorted(sortBy?: SortBy): boolean {
  switch (sortBy) {
    case SortBy.Name:
    case SortBy.CreatedAt:
    case SortBy.UpdatedAt:
      return true;
    default:
      return false;
  }
}

export function getSortString(sortBy?: SortBy): string | undefined {
  switch (sortBy) {
    case SortBy.Name:
      return 'Name';
    case SortBy.FileSize:
      return 'Size';
    case SortBy.CreatedAt:
      return 'Created';
    case SortBy.UpdatedAt:
      return 'Modified';
    default:
      return undefined;
  }
}

export function getQuerySortString(sortBy?: SortBy): string | undefined {
  switch (sortBy) {
    case SortBy.Name:
      return 'Name';
    case SortBy.FileSize:
      return 'FileSize';
    case SortBy.CreatedAt:
      return 'CreatedAt';
    case SortBy.UpdatedAt:
      return 'UpdatedAt';
    default:
      return undefined;
  }
}
