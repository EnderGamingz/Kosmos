import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { queryClient } from '@lib/query.ts';
import {
  AlbumResponse,
  AvailableAlbumsForFileResponse,
} from '@models/album.ts';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export class AlbumQuery {
  private static getAlbumData = (id: string) =>
    axios
      .get(`${BASE_URL}auth/album/${id}`)
      .then(res => res.data as AlbumResponse);

  public static useAlbums = () => {
    return useQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/album`)
          .then(res => res.data as AlbumModelDTO[]),
      queryKey: ['album'],
    });
  };

  public static useAlbum = (id?: string) => {
    return useQuery({
      queryFn: () => this.getAlbumData(id!),
      queryKey: ['album', id],
      enabled: !!id,
      // Preventing the query from fetching after being prefetched
      staleTime: 10_000,
    });
  };

  public static useInfiniteAvailableFiles = () => {
    return useInfiniteQuery({
      queryFn: ({ pageParam }) =>
        axios
          .get(`${BASE_URL}auth/album/available`, {
            params: {
              page: pageParam,
            },
          })
          .then(res => res.data as FileModelDTO[]),
      queryKey: ['files', 'album', 'available'],
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

  public static useAvailableAlbums = (fileIds: string[]) => {
    return useQuery({
      queryFn: () =>
        axios
          .post(`${BASE_URL}auth/album/for`, {
            files: fileIds,
          })
          .then(res => res.data as AvailableAlbumsForFileResponse),
      queryKey: ['album', 'available'],
    });
  };

  public static prefetchAlbum = (id: string) => {
    return queryClient.prefetchQuery({
      queryFn: () => this.getAlbumData(id),
      queryKey: ['album', id],
    });
  };

  public static invalidateAlbums = () =>
    queryClient.invalidateQueries({
      queryKey: ['album'],
    });

  public static invalidateAlbum = (id: string) =>
    queryClient.invalidateQueries({
      queryKey: ['album', id],
    });

  public static invalidateAvailableAlbums = () =>
    queryClient.invalidateQueries({
      queryKey: ['album', 'available'],
    });
}
