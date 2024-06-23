import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '@components/header';
import { Register } from '@pages/register.tsx';
import { Login } from '@pages/login.tsx';
import { AccessWrapper } from './accessWrapper.tsx';
import Dashboard from '@pages/explorer/dashboard.tsx';
import BinPage from '@pages/explorer/bin';
import NotificationIndicator from '@components/notifications';
import { FileList } from '@pages/explorer/fileList.tsx';
import { useInitializeKeys } from '@hooks/useInitKeys.ts';
import Settings from '@pages/settings/index.tsx';

export function Router() {
  const fetchUser = useUserState(s => s.fetchUser);
  const user = useUserState();

  useInitializeKeys();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path={'auth/register'} element={<Register />} />
        <Route path={'auth/login'} element={<Login />} />
        <Route
          path={'home'}
          element={<AccessWrapper el={<Dashboard />} page={'Dashboard'} />}>
          {user.user && (
            <>
              <Route path={'bin'} element={<BinPage />} />
              <Route path={'folder/:folder'} element={<FileList />} />
              <Route index element={<FileList />} />
            </>
          )}
        </Route>
        <Route
          path={'settings/*'}
          element={<AccessWrapper el={<Settings />} page={'Settings'} />}
        />
      </Routes>
      <NotificationIndicator />
    </BrowserRouter>
  );
}
