import { FormEvent, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import { queryClient } from '../../main.tsx';
import { useParams } from 'react-router-dom';

export default function CreateFolder() {
  const { folder } = useParams();
  const [name, setName] = useState('');

  const { mutate } = useMutation({
    mutationFn: () =>
      axios.post(`${BASE_URL}auth/folder${folder ? `/${folder}` : ''}`, {
        name,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ['folders'],
      });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div>
      <form className={'flex max-w-sm flex-col gap-3'} onSubmit={handleSubmit}>
        <input
          type={'text'}
          placeholder={'Name'}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          type={'button'}
          className={
            'flex items-center gap-1 rounded-md bg-blue-400 px-4 py-2'
          }>
          <PlusIcon className={'h-5 w-5'} /> Create
        </button>
      </form>
    </div>
  );
}
