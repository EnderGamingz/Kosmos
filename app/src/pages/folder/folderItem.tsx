import { FolderModel } from '../../../models/folder.ts';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import { queryClient } from '../../main.tsx';

export function FolderItem({ folder }: { folder: FolderModel }) {
  const moveAction = useMutation({
    mutationFn: () =>
      axios.put(`${BASE_URL}auth/folder/move/${folder.id}?folder_id=`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ['folders'],
      });
    },
  });

  const deleteAction = useMutation({
    mutationFn: () => axios.delete(`${BASE_URL}auth/folder/${folder.id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ['folders'],
      });
    },
  });

  return (
    <li className={'flex items-center justify-between'}>
      <Link to={`/home/${folder.id.toString()}`}>{folder.folder_name}</Link>
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
