import { QueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../vars.ts';
import { FolderResponse } from '../../models/folder.ts';
import { FileModel } from '../../models/file.ts';

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
    queryKey: ['files'],
  });
}

export const useFolders = (parent_id?: string) => {
  return useQuery({
    queryFn: () =>
      axios
        .get(`${BASE_URL}auth/folder/all${parent_id ? `/${parent_id}` : ''}`)
        .then(res => res.data as FolderResponse),
    queryKey: ['folders', parent_id],
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
