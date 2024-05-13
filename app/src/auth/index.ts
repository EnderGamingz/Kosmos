import { useUserState } from '../stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function useEnsureLoggedIn() {
  const user = useUserState(s => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user]);

  return user;
}
