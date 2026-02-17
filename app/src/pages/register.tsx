import axios from 'axios';
import { ALLOW_REGISTER, BASE_URL } from '@lib/env.ts';
import { useMutation } from '@tanstack/react-query';
import type { SubmitEventHandler } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { AuthScreen } from '@pages/authScreen.tsx';
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';
import { KeyRound, User } from 'lucide-react';

type RegisterData = { username: string; password: string };

export default function Register() {
  const notification = useNotifications(s => s.actions);
  const navigate = useNavigate();

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: RegisterData) => {
      const registerId = notification.notify({
        title: 'Register',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });

      await axios
        .post(`${BASE_URL}auth/register`, {
          username: data.username,
          password: data.password,
        })
        .then(() => {
          notification.updateNotification(registerId, {
            severity: Severity.SUCCESS,
            status: 'Success',
            timeout: 1000,
            canDismiss: true,
          });
          navigate('/auth/login');
        })
        .catch(err => {
          notification.updateNotification(registerId, {
            status: 'Failed',
            description:
              err.response?.data?.error || err.response?.data || 'Error',
            severity: Severity.ERROR,
            canDismiss: true,
          });
        });
    },
  });

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    const { username, password } = event.currentTarget;
    mutate({ username: username.value, password: password.value });
  };

  if (!ALLOW_REGISTER) return <Navigate to={'/auth/login'} />;

  return (
    <AuthScreen
      title={'Register'}
      subtitle={'Create a new Kosmos Account'}
      onSubmit={handleSubmit}
      secondaryAction={{
        condition: true,
        text: 'Already have an account?',
        actionText: 'Login',
        link: '/auth/login',
      }}
    >
      <label htmlFor={'username'} className={'animate-fade-in-top delay-200'}>
        <User />
        <Input
          id={'username'}
          placeholder={'Username'}
          type={'text'}
          name={'username'}
          minLength={3}
          required
        />
      </label>
      <label htmlFor={'password'} className={'animate-fade-in-top delay-300'}>
        <KeyRound />
        <Input
          id={'password'}
          placeholder={'Password'}
          type={'password'}
          name={'password'}
          minLength={6}
          required
        />
      </label>
      <div className={'animate-fade-in-top delay-400'}>
        <Button
          className={
            'lg:text-lg w-full group-invalid:cursor-not-allowed group-invalid:opacity-50'
          }
          disabled={isPending}
          type={'submit'}
        >
          Register
        </Button>
      </div>
    </AuthScreen>
  );
}
