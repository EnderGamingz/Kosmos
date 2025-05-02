import { useUserState } from '@stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@stores/notificationStore.ts';
import { JWT_TOKEN_STORAGE_KEY } from '@lib/constants.ts';

export default function useLogout() {
  const userLogout = useUserState(s => s.logout);
  const navigate = useNavigate();
  const clearNotifications = useNotifications(
    s => s.actions.clearNotifications,
  );

  return () => {
    localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
    userLogout();
    clearNotifications();
    navigate('/auth/login');
  };
}
