import { QueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL, IS_DEVELOPMENT } from './vars.ts';
import { FolderResponse } from '@models/folder.ts';
import { FileModel, DataOperationType } from '@models/file.ts';
import { OperationModel } from '@models/operation.ts';

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

export const useFolders = (parent_id?: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/folder/all${parent_id ? `/${parent_id}` : ''}`)
        .then(res => res.data as FolderResponse),
    queryKey: ['folders', parent_id],
    _optimisticResults: 'isRestoring',
  });
};

export const useFiles = (parent_id?: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/file/all${parent_id ? `/${parent_id}` : ''}`)
        .then(res => res.data as FileModel[]),
    queryKey: ['files', parent_id],
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
          active: res.data.active,
          bin: res.data.bin,
        };
      }),
    queryKey: ['usage'],
    refetchOnMount: false,
  });
};

export const useOperations = () => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/operation/all`)
        .then(res => res.data as OperationModel[]),
    queryKey: ['operations'],
    refetchOnMount: true,
    // 20 seconds
    refetchInterval: IS_DEVELOPMENT ? 5_000 : 20_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
};

export async function invalidateOperations() {
  return queryClient.invalidateQueries({
    queryKey: ['operations'],
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
