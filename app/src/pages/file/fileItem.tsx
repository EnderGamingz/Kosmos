import { FileModel, FileType, getFileTypeById } from '../../../models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import { queryClient } from '../../main.tsx';

export function FileItem({ file }: { file: FileModel }) {
  const moveAction = useMutation({
    mutationFn: () =>
      axios.put(`${BASE_URL}auth/file/move/${file.id}?folder_id=`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ['files'],
      });
    },
  });

  const deleteAction = useMutation({
    mutationFn: () => axios.delete(`${BASE_URL}auth/file/${file.id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ['files'],
      });
    },
  });

  return (
    <li className={'flex items-center justify-between'}>
      {[FileType.Image, FileType.RawImage].some(
        x => x === getFileTypeById(file.file_type),
      ) && (
        <img
          src={`${BASE_URL}auth/file/image/${file.id}/0`}
          alt={file.file_name}
        />
      )}
      <div>{file.file_name}</div>
      <div>
        <button
          onClick={() => moveAction.mutate()}
          disabled={moveAction.isPending}>
          Move to home
        </button>
        <button
          onClick={() => deleteAction.mutate()}
          disabled={deleteAction.isPending}>
          Delete
        </button>
      </div>
    </li>
  );
}
