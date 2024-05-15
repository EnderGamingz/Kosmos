import { FileModel } from '../../type/file.ts';
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

  return (
    <li className={'flex items-center justify-between'}>
      <div>{file.file_name}</div>
      <div>
        <button
          onClick={() => moveAction.mutate()}
          disabled={moveAction.isPending}>
          Move to home
        </button>
      </div>
    </li>
  );
}
