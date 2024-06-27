import { useUserState } from '@stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@stores/notificationStore.ts';

export default function useLogout() {
  const userLogout = useUserState(s => s.logout);
  const navigate = useNavigate();
  const clearNotifications = useNotifications(
    s => s.actions.clearNotifications,
  );

  return () => {
    userLogout();
    clearNotifications();
    navigate('/auth/login');
  };
}
