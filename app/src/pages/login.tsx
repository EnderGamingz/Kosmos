import { useUserState } from '@stores/userStore';
import axios from 'axios';
import { ALLOW_REGISTER, BASE_URL } from '@lib/env.ts';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { KeyIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { AuthScreen } from '@pages/authScreen.tsx';
import PasskeyLogin from '@components/passkey/login.tsx';
import { useConditionalPasskeyLogin } from '@components/passkey/useConditionalPasskeyLogin.ts';

type LoginData = { username: string; password: string };

export default function Login() {
  const navigate = useNavigate();
  const userState = useUserState();
  const notification = useNotifications(s => s.actions);

  useEffect(() => {
    if (userState.user) navigate('/home');
  }, [navigate, userState.user]);

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
          userState.setUser(res.data);
          navigate('/home');
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

  useConditionalPasskeyLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { username, password } = event.currentTarget;

    if (!username.value || !password.value) {
      return;
    }

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
      <motion.label
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}>
        <UserIcon />
        <input
          className={'input'}
          placeholder={'Username'}
          type={'text'}
          name={'username'}
          autoComplete={'username webauthn'}
        />
      </motion.label>
      <motion.label
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>
        <KeyIcon />
        <input
          className={'input'}
          placeholder={'Password'}
          type={'password'}
          name={'password'}
          autoComplete={'current-password webauthn'}
        />
      </motion.label>
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={'btn-black mt-2 lg:text-lg'}
        disabled={isPending}
        type={'submit'}>
        Login
      </motion.button>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className={'relative'}>
        <hr className={'my-2 border-stone-800/30'} />
        <p
          className={
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-50 px-2 text-sm'
          }>
          or
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}>
        <PasskeyLogin />
      </motion.div>
    </AuthScreen>
  );
}
