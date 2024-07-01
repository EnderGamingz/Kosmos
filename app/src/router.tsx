import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '@components/header';
import { Register } from '@pages/register.tsx';
import { Login } from '@pages/login.tsx';
import { AccessWrapper } from './accessWrapper.tsx';
import Dashboard from '@pages/explorer/dashboard.tsx';
import NotificationIndicator from '@components/notifications';
import { FileList } from '@pages/explorer/fileList.tsx';
import { useInitializeKeys } from '@hooks/useInitKeys.ts';
import Settings from '@pages/settings/index.tsx';
import BinPage from '@pages/explorer/pages/bin';
import RecentFiles from '@pages/explorer/pages/recent.tsx';
import Preferences from '@pages/settings/preferences';
import AccountSettings from '@pages/settings/account';

export default function Router() {
  const fetchUser = useUserState(s => s.fetchUser);

  useInitializeKeys();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Header />
      <main className={'relative flex flex-grow flex-col'}>
        <Routes>
          <Route path={'auth/register'} element={<Register />} />
          <Route path={'auth/login'} element={<Login />} />
          <Route
            path={'home'}
            element={<AccessWrapper el={<Dashboard />} page={'Dashboard'} />}>
            <Route path={'recent'} element={<RecentFiles />} />
            <Route path={'bin'} element={<BinPage />} />
            <Route path={'folder/:folder'} element={<FileList />} />
            <Route index element={<FileList />} />
          </Route>
          <Route
            path={'settings'}
            element={<AccessWrapper el={<Settings />} page={'Settings'} />}>
            <Route path={'preferences'} element={<Preferences />} />
            <Route path={'account'} element={<AccountSettings />} />
            <Route index element={<AccountSettings />} />
          </Route>
        </Routes>
      </main>
      <NotificationIndicator />
    </BrowserRouter>
  );
}
