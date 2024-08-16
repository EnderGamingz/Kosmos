import { QueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL, IS_DEVELOPMENT } from './env.ts';
import { FolderResponse, FolderShareResponse } from '@models/folder.ts';
import {
  ContextOperationType,
  FileModel,
  ShareFileModel,
  ShareOperationType,
} from '@models/file.ts';
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
import { FALLBACK_STORAGE_LIMIT } from '@lib/constants.ts';
import { SearchResponse } from '@models/search.ts';
import { FavoritesResponse } from '@models/favorites.ts';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import { AlbumShareResponse } from '@models/album.ts';
import { PasskeyModel } from '@models/passkey.ts';

export const queryClient = new QueryClient();

export async function invalidateItems() {
  await invalidateFiles();
  await invalidateFolders();
}

export async function invalidateFiles() {
  await queryClient.invalidateQueries({
    queryKey: ['files'],
  });
  await queryClient.invalidateQueries({
    queryKey: ['shared'],
  });
  await queryClient.invalidateQueries({
    queryKey: ['search'],
  });
  await AlbumQuery.invalidateAlbums();
}

export async function invalidateFilesInFolder(folder_id?: string) {
  await queryClient.invalidateQueries({
    queryKey: ['files', folder_id],
  });
}

export async function invalidateFolders() {
  await queryClient.invalidateQueries({
    queryKey: ['folders'],
  });
  await queryClient.invalidateQueries({
    queryKey: ['shared'],
  });
  await queryClient.invalidateQueries({
    queryKey: ['search'],
  });
}

export const useSearch = (query: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/search`, {
          params: { q: query },
        })
        .then(res => res.data as SearchResponse),
    enabled: !!query,
    queryKey: ['search', query],
  });
};

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

export const useFilesInfinite = (
  parent_id?: string,
  sort?: SortParams,
  limit?: number,
) => {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) =>
      axios
        .get(`${BASE_URL}auth/file/all${parent_id ? `/${parent_id}` : ''}`, {
          params: {
            sort_by: getQuerySortString(sort?.sort_by),
            sort_order: getSortOrderString(sort?.sort_order),
            limit: limit,
            page: pageParam,
          },
        })
        .then(res => res.data as FileModel[]),
    queryKey: ['files', parent_id, sort],
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (limit && lastPage.length < limit) return undefined;
      if (lastPage.length === 0) return undefined;
      return lastPageParam + 1;
    },
    getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
      if (firstPageParam <= 1) return undefined;
      return firstPageParam - 1;
    },
  });
};

export const useFileByTypeInfinite = (fileType: number, limit: number) => {
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
      if (limit && lastPage.length < limit) return undefined;
      if (lastPage.length === 0) return undefined;
      return lastPageParam + 1;
    },
    getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
      if (firstPageParam <= 1) return undefined;
      return firstPageParam - 1;
    },
  });
};

export const useRecentFiles = (limit?: number) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all/recent`, {
          params: {
            limit: limit,
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

export const useFavorites = () => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/favorite`)
        .then(res => res.data as FavoritesResponse),
    queryKey: ['favorites', 'all'],
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

export const useUserShareData = (id: string, type: ShareOperationType) => {
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

export const useAccessAlbumShare = (uuid: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}s/album/${uuid}`)
        .then(res => res.data as AlbumShareResponse),
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

export const useFileContent = (fileId: string, url?: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(url ?? `${BASE_URL}auth/file/${fileId}/action/Serve`)
        .then(res => res.data.toString()),
    queryKey: ['file', 'content', fileId],
  });
};

export const setFileContent = (fileId: string, content: string) => {
  return queryClient.setQueryData(['file', 'content', fileId], content);
};

export const usePasskeys = () => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/passkey`)
        .then(res => res.data as PasskeyModel[]),
    queryKey: ['passkeys'],
  });
};

export async function invalidatePasskeys() {
  return queryClient.invalidateQueries({
    queryKey: ['passkeys'],
  });
}

export async function invalidateFavorites() {
  return queryClient.invalidateQueries({
    queryKey: ['favorites'],
  });
}

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

export async function invalidateData(type: ContextOperationType) {
  if (type == 'folder') await invalidateFolders();
  else if (type === 'multi') await invalidateItems();
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
