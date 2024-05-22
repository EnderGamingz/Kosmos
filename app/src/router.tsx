import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './pages/login.tsx';
import { useEffect } from 'react';
import { useUserState } from './stores/userStore.ts';
import { Register } from './pages/register.tsx';
import { FileList } from './pages/explorer/fileList.tsx';
import Dashboard from './pages/explorer/dashboard.tsx';
import { AccessWrapper } from './accessWrapper.tsx';

export function Router() {
  const user = useUserState();

  useEffect(() => {
    user.fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={'auth/register'} element={<Register />} />
        <Route
          path={'home'}
          element={<AccessWrapper el={<Dashboard />} page={'Dashboard'} />}>
          {user.user && (
            <>
              <Route index element={<FileList />} />
              <Route path={':folder'} element={<FileList />} />
            </>
          )}
        </Route>
        <Route path={''} element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
