import { useUserState } from '@stores/userStore';
import axios from 'axios';
import { ALLOW_REGISTER, BASE_URL } from '@lib/env.ts';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { AuthScreen } from '@pages/authScreen.tsx';
import PasskeyLogin from '@components/passkey/login.tsx';
import { useConditionalPasskeyLogin } from '@components/passkey/useConditionalPasskeyLogin.ts';
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';
import { KeyRound, User } from 'lucide-react';

type LoginData = { username: string; password: string };

export default function Login() {
  const [searchParams] = useSearchParams();
  const willRedirect = useRef(false);
  const navigate = useNavigate();
  const userState = useUserState();
  const notification = useNotifications(s => s.actions);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (userState.user && !willRedirect.current) {
      navigate('/home');
    }
  }, [userState.user]);

  const { isPending, mutate } = useMutation({
    mutationFn: async ({ username, password }: LoginData) => {
      const loginIn = notification.notify({
        title: 'Login',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });

      await axios
        .post(`${BASE_URL}auth/login`, {
          username,
          password,
        })
        .then(res => {
          willRedirect.current = true;
          userState.setUser(res.data);

          const returnPath = searchParams.get('return');
          navigate(returnPath ?? '/home');

          notification.clearNotifications();
        })
        .catch(err => {
          notification.updateNotification(loginIn, {
            status: 'Failed',
            description: err.response?.data?.error || 'Error',
            severity: Severity.ERROR,
            canDismiss: true,
            timeout: 2000,
          });
        });
    },
  });

  const restartConditionalPasskey = useConditionalPasskeyLogin(controller);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { username, password } = event.currentTarget;

    if (!username.value || !password.value) return;

    mutate({ username: username.value, password: password.value });
  }

  return (
    <AuthScreen
      title={'Log in'}
      subtitle={'Login to your Kosmos account'}
      onSubmit={handleSubmit}
      secondaryAction={{
        condition: ALLOW_REGISTER,
        text: "Don't have an account?",
        actionText: 'Create one here',
        link: '/auth/register',
      }}>
      <label htmlFor={'username'} className={'animate-fade-in-top delay-200'}>
        <User />
        <Input
          id={'username'}
          placeholder={'Username'}
          type={'text'}
          name={'username'}
          autoComplete={'username webauthn'}
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
          autoComplete={'current-password webauthn'}
          minLength={6}
          required
        />
      </label>
      <div className={'animate-fade-in-top delay-400'}>
        <Button
          disabled={isPending}
          type={'submit'}
          className={
            'lg:text-lg w-full group-invalid:cursor-not-allowed group-invalid:opacity-50'
          }>
          Login
        </Button>
      </div>
      <div className={'relative animate-fade-in-left delay-500'}>
        <hr className={'my-2 border-stone-800/30 dark:border-stone-300/50'} />
        <p
          className={
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm'
          }>
          or
        </p>
      </div>
      <div className={'animate-fade-in-bottom delay-600'}>
        <PasskeyLogin
          conditionalAbortController={controller}
          onFail={restartConditionalPasskey}
        />
      </div>
    </AuthScreen>
  );
}
