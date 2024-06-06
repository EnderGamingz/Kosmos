import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './pages/login.tsx';
import { useEffect } from 'react';
import { useUserState } from './stores/userStore.ts';
import { Register } from './pages/register.tsx';
import { FileList } from './pages/explorer/fileList.tsx';
import Dashboard from './pages/explorer/dashboard.tsx';
import { AccessWrapper } from './accessWrapper.tsx';
import NotificationIndicator from './components/notifications';
import Header from './components/header';
import BinPage from './pages/explorer/bin/index.tsx';

export function Router() {
  const fetchUser = useUserState(s => s.fetchUser);
  const user = useUserState();

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
      </Routes>
      <NotificationIndicator />
    </BrowserRouter>
  );
}
