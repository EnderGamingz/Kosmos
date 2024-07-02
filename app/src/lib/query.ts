import { QueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL, FALLBACK_STORAGE_LIMIT, IS_DEVELOPMENT } from './vars.ts';
import { FolderResponse } from '@models/folder.ts';
import { DataOperationType, FileModel } from '@models/file.ts';
import { OperationModel } from '@models/operation.ts';
import {
  canFolderBeSorted,
  getQuerySortString,
  getSortOrderString,
  SortParams,
  SortParamsForQuery,
} from '@models/sort.ts';
import { UsageResponse } from '@models/user.ts';
import { ShareModel } from '@models/share.ts';

export const queryClient = new QueryClient();

export async function invalidateFiles() {
  await queryClient.invalidateQueries({
    exact: false,
    queryKey: ['files'],
  });
}

export async function invalidateFolders() {
  await queryClient.invalidateQueries({
    exact: false,
    queryKey: ['folders'],
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

export const useUsage = () => {
  return useQuery({
    queryFn: () =>
      axios.get(`${BASE_URL}auth/user/usage`).then(res => {
        return {
          active: parseInt(res.data.active) ?? 0,
          bin: parseInt(res.data.bin) ?? 0,
          total: parseInt(res.data.total) ?? 0,
          limit: parseInt(res.data.limit) ?? FALLBACK_STORAGE_LIMIT,
        } satisfies UsageResponse;
      }),
    queryKey: ['usage'],
    placeholderData: {
      active: 0,
      bin: 0,
      total: 0,
      limit: FALLBACK_STORAGE_LIMIT,
    },
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
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
};

export const useUserShareData = (id: string, type: DataOperationType) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/share/${type}/${id}`)
        .then(res => res.data as ShareModel[]),
    queryKey: ['share', id],
  });
};

export async function refetchShareData() {
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

export async function invalidateBin() {
  return queryClient.invalidateQueries({
    queryKey: ['files', 'deleted'],
  });
}
