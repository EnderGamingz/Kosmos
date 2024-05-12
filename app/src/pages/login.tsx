import { useUserState } from '../stores/userStore.ts';
import axios from 'axios';
import { BASE_URL } from '../vars.ts';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const updateUser = useUserState(s => s.setUser);

  const loginFn = () =>
    axios.post(BASE_URL + 'auth/login', {
      username,
      password,
    });

  const { isPending, mutate } = useMutation({
    mutationFn: loginFn,
    onSuccess: res => {
      const userRes = JSON.parse(res.data.message);
      updateUser(userRes);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate();
  }

  return (
    <div className={'container mx-auto mt-20 max-w-lg'}>
      <form onSubmit={handleSubmit} className={'flex flex-col gap-4'}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          type={'text'}
          name={'username'}
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type={'password'}
          name={'password'}
        />
        <button disabled={isPending} type={'submit'}>
          Login
        </button>
      </form>
    </div>
  );
}
