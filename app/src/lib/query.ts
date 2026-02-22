import { QueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from './env.ts';
import type { ContextOperationType, ShareOperationType } from '@models/file.ts';
import {
  canFolderBeSorted,
  getQuerySortString,
  getSortOrderString,
  type SortParams,
  type SortParamsForQuery,
} from '@models/sort.ts';
import { FALLBACK_STORAGE_LIMIT } from '@lib/constants.ts';
import { AlbumQuery } from '@lib/queries/albumQuery.ts';
import type { AlbumShareResponse } from '@models/album.ts';
import type { OperationModelDTO } from '@bindings/OperationModelDTO.ts';
import type { DiskUsageReport } from '@bindings/DiskUsageReport.ts';
import type { DiskUsageStats } from '@bindings/DiskUsageStats.ts';
import type { ExtendedShareModelDTO } from '@bindings/ExtendedShareModelDTO.ts';
import type { SharedItems } from '@bindings/SharedItems.ts';
import type { ExplorerSearchDTO } from '@bindings/ExplorerSearchDTO.ts';
import type { PasskeyModelDTO } from '@bindings/PasskeyModelDTO.ts';
import type { FavoritesResponse } from '@bindings/FavoritesResponse.ts';
import type { FolderShareData } from '@bindings/FolderShareData.ts';
import type { FolderResponse } from '@bindings/FolderResponse.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { ShareFileModelDTO } from '@bindings/ShareFileModelDTO.ts';
import { createZipInformationUrl } from '@lib/file.ts';
import type { ZipInformation } from '@bindings/ZipInformation.ts';
import type { PresenceOperationsUpdate } from '@bindings/PresenceOperationsUpdate.ts';

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
  if (!folder_id) {
    await invalidateFiles();
    return;
  }
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

export async function invalidateFolder(id?: string | null) {
  if (!id) {
    await queryClient.invalidateQueries({
      queryKey: ['folders'],
    });
    return;
  }
  await queryClient.invalidateQueries({
    queryKey: ['folders', id],
  });
}

export const useSearch = (query: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/search`, {
          params: { q: query },
        })
        .then(res => res.data as ExplorerSearchDTO),
    enabled: !!query,
    queryKey: ['search', query],
  });
};

export const prefetchSearch = (query: string) => {
  return queryClient.prefetchQuery({
    queryKey: ['search', query],
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/search`, {
          params: { q: query },
        })
        .then(res => res.data as ExplorerSearchDTO),
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
            album_files: sort?.album_files,
          },
        })
        .then(res => res.data as FileModelDTO[]),
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
        .then(res => res.data as FileModelDTO[]),
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
        .then(res => res.data as FileModelDTO[]),
    queryKey: ['files', 'recent'],
  });
};

export const prefetchRecentFiles = () => {
  return queryClient.prefetchQuery({
    queryKey: ['files', 'recent'],
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all/recent`, {
          withCredentials: true,
        })
        .then(res => res.data as FileModelDTO[]),
  });
};

export const useDeletedFiles = () => {
  return useQuery({
    queryKey: ['files', 'deleted'],
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all/deleted`)
        .then(res => res.data as FileModelDTO[]),
  });
};

export const prefetchDeletedFiles = () => {
  return queryClient.prefetchQuery({
    queryKey: ['files', 'deleted'],
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all/deleted`, { withCredentials: true })
        .then(res => res.data as FileModelDTO[]),
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
        .then(res => res.data as DiskUsageStats),
    queryKey: ['usage', 'stats'],
    placeholderData: {
      active: 0,
      bin: 0,
      total: 0,
      limit: FALLBACK_STORAGE_LIMIT,
    } satisfies DiskUsageStats,
    refetchOnWindowFocus: false,
  });
};

export const useUsageReport = () => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/user/usage/report`)
        .then(res => res.data as DiskUsageReport),
    queryKey: ['usage', 'report'],
    refetchOnWindowFocus: false,
  });
};

export const useOperations = (onUnauthorized?: () => void) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/operation/all`)
        .then(res => res.data as OperationModelDTO[])
        .catch(e => {
          if (e.response?.status === 401) {
            onUnauthorized?.();
          }
          return [] as OperationModelDTO[];
        }),
    queryKey: ['operations'],
    refetchOnWindowFocus: true,
  });
};

export function handlePresenceOperationsUpdate(data: PresenceOperationsUpdate) {
  queryClient.setQueryData(['operations'], data.content);
}

export const useSharedItems = (forUser?: boolean) => {
  const userSpecificEndpoint = forUser ? '/me' : '';

  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/share/all${userSpecificEndpoint}`)
        .then(res => res.data as SharedItems),
    queryKey: ['share', 'items', userSpecificEndpoint],
  });
};

export const useUserShareData = (id: string, type: ShareOperationType) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/share/${type}/${id}`)
        .then(res => res.data as ExtendedShareModelDTO[]),
    queryKey: ['share', id, type],
    enabled: !!id && !!type,
  });
};

export const useAccessShareFile = (uuid: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}s/file/${uuid}`)
        .then(res => res.data as ShareFileModelDTO),
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
        .then(res => res.data as FolderShareData),
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
        .then(res => res.data as PasskeyModelDTO[]),
    queryKey: ['passkeys'],
  });
};

export const useZipInformation = (
  shareUuid?: string,
  isSharedInFolder?: boolean,
  fileId?: string | null,
) => {
  const url = createZipInformationUrl(shareUuid, isSharedInFolder, fileId);
  return useQuery({
    queryFn: () => axios.get(url).then(res => res.data as ZipInformation),
    queryKey: ['zip', fileId, shareUuid],
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
  if (type === 'folder') await invalidateFolders();
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
