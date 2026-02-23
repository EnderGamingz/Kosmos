import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useInitializeKeys } from '@hooks/useInitKeys.ts';
import { router } from '@/router/router.tsx';

export default function AppRouter() {
  const fetchUser = useUserState(s => s.fetchUser);

  useInitializeKeys();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  //useServiceWorker();

  return <RouterProvider router={router} />;
}
