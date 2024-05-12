import axios from 'axios';
import { BASE_URL } from '../vars.ts';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const registerFn = () =>
    axios.post(BASE_URL + 'auth/register', {
      username,
      password,
    });

  const { isPending, mutate } = useMutation({
    mutationFn: registerFn,
    onSuccess: () => {
      navigate('/');
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
          Register
        </button>
      </form>
    </div>
  );
}
