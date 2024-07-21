import axios from 'axios';
import { ALLOW_REGISTER, BASE_URL } from '@lib/env.ts';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { AuthScreen } from '@pages/authScreen.tsx';
import { motion } from 'framer-motion';
import { KeyIcon, UserIcon } from '@heroicons/react/24/outline';

type RegisterData = { username: string; password: string };

export function Register() {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { username, password } = event.currentTarget;
    mutate({ username: username.value, password: password.value });
  }

  useEffect(() => {
    if (!ALLOW_REGISTER) {
      navigate('/auth/login');
    }
  }, [navigate]);

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
        />
      </motion.label>
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={'btn-black mt-5 lg:text-lg'}
        disabled={isPending}
        type={'submit'}>
        Register
      </motion.button>
    </AuthScreen>
  );
}
