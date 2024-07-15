import { QueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL, FALLBACK_STORAGE_LIMIT, IS_DEVELOPMENT } from './vars.ts';
import { FolderResponse, FolderShareResponse } from '@models/folder.ts';
import { DataOperationType, FileModel, ShareFileModel } from '@models/file.ts';
import { OperationModel } from '@models/operation.ts';
import {
  canFolderBeSorted,
  getQuerySortString,
  getSortOrderString,
  SortParams,
  SortParamsForQuery,
} from '@models/sort.ts';
import { SharedItemsResponse, ShareModel } from '@models/share.ts';
import { UsageReport, UsageStats } from '@models/usage.ts';

export const queryClient = new QueryClient();

export async function invalidateFiles() {
  await queryClient.invalidateQueries({
    queryKey: ['files'],
  });
  await queryClient.invalidateQueries({
    queryKey: ['shared'],
  });
}

export async function invalidateFolders() {
  await queryClient.invalidateQueries({
    queryKey: ['folders'],
  });
  await queryClient.invalidateQueries({
    queryKey: ['shared'],
  });
}

export const useFolders = (parent_id?: string, sort?: SortParams) => {
  return useQuery({
    queryFn: async () => {
      const params: SortParamsForQuery = {
        limit: sort?.limit,
        offset: sort?.offset,
      };

      if (canFolderBeSorted(sort?.sort_by)) {
        params.sort_by = getQuerySortString(sort?.sort_by);
        params.sort_order = getSortOrderString(sort?.sort_order);
      }

      const res = await axios.get(
        `${BASE_URL}auth/folder/all${parent_id ? `/${parent_id}` : ''}`,
        {
          params: params,
        },
      );
      return res.data as FolderResponse;
    },
    queryKey: ['folders', parent_id, sort],
  });
};

export const useFiles = (parent_id?: string, sort?: SortParams) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all${parent_id ? `/${parent_id}` : ''}`, {
          params: {
            sort_by: getQuerySortString(sort?.sort_by),
            sort_order: getSortOrderString(sort?.sort_order),
            limit: sort?.limit,
            offset: sort?.offset,
          },
        })
        .then(res => res.data as FileModel[]),
    queryKey: ['files', parent_id, sort],
  });
};

export const useFileByTypeInfinite = (fileType: number, limit?: number) => {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) =>
      axios
        .get(`${BASE_URL}auth/file/all/type/${fileType}`, {
          params: {
            limit: limit,
            page: pageParam,
          },
        })
        .then(res => res.data as FileModel[]),
    queryKey: ['files', 'type', fileType],
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length === 0) return undefined;
      return lastPageParam + 1;
    },
    getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
      if (firstPageParam <= 1) return undefined;
      return firstPageParam - 1;
    },
  });
};

export const useRecentFiles = (limit?: number, offset?: number) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all/recent`, {
          params: {
            limit: limit,
            offset: offset,
          },
        })
        .then(res => res.data as FileModel[]),
    queryKey: ['files', 'recent'],
  });
};

export const useDeletedFiles = () => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all/deleted`)
        .then(res => res.data as FileModel[]),
    queryKey: ['files', 'deleted'],
  });
};

export const useUsageStats = () => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/user/usage/stats`)
        .then(res => res.data as UsageStats),
    queryKey: ['usage', 'stats'],
    placeholderData: {
      active: 0,
      bin: 0,
      total: 0,
      limit: FALLBACK_STORAGE_LIMIT,
    } satisfies UsageStats,
    refetchOnWindowFocus: false,
  });
};

export const useUsageReport = () => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/user/usage/report`)
        .then(res => res.data as UsageReport),
    queryKey: ['usage', 'report'],
    refetchOnWindowFocus: false,
  });
};

export const useOperations = (onUnauthorized?: () => void) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/operation/all`)
        .then(res => res.data as OperationModel[])
        .catch(e => {
          if (e.response?.status === 401) {
            onUnauthorized?.();
          }
          return [] as OperationModel[];
        }),
    queryKey: ['operations'],
    // 20 seconds
    refetchInterval: IS_DEVELOPMENT ? 5_000 : 20_000,
    refetchOnWindowFocus: true,
  });
};

export const useSharedItems = (forUser?: boolean) => {
  const userSpecificEndpoint = forUser ? '/me' : '';

  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/share/all${userSpecificEndpoint}`)
        .then(res => res.data as SharedItemsResponse),
    queryKey: ['share', 'items', userSpecificEndpoint],
  });
};

export const useUserShareData = (id: string, type: DataOperationType) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/share/${type}/${id}`)
        .then(res => res.data as ShareModel[]),
    queryKey: ['share', id, type],
  });
};

export const useAccessShareFile = (uuid: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}s/file/${uuid}`)
        .then(res => res.data as ShareFileModel),
    queryKey: ['share-access', uuid],
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useAccessShareFolder = (uuid: string, folderId?: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(
          `${BASE_URL}s/folder/${uuid}${folderId ? `/Folder/${folderId}` : ''}`,
        )
        .then(res => res.data as FolderShareResponse),
    queryKey: ['share-access', uuid, folderId],
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export async function invalidateShareAccess() {
  return queryClient.invalidateQueries({
    queryKey: ['share-access'],
  });
}

export async function invalidateShares() {
  return queryClient.invalidateQueries({
    queryKey: ['share'],
  });
}

export async function refetchOperations() {
  return queryClient.refetchQueries({
    queryKey: ['operations'],
  });
}

export async function invalidateData(type: DataOperationType) {
  if (type == 'folder') await invalidateFolders();
  else await invalidateFiles();
}

export async function invalidateUsage() {
  return queryClient.invalidateQueries({
    queryKey: ['usage'],
  });
}

export async function invalidateUsageReport() {
  return queryClient.invalidateQueries({
    queryKey: ['usage', 'report'],
  });
}

export async function invalidateBin() {
  return queryClient.invalidateQueries({
    queryKey: ['files', 'deleted'],
  });
}
