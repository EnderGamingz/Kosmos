import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './pages/login.tsx';
import { useEffect } from 'react';
import { useUserState } from './stores/userStore.ts';
import Dashboard, { FileList } from './pages/dashboard.tsx';
import { Register } from './pages/register.tsx';

export function Router() {
  const userFetch = useUserState(state => state.fetchUser);
  useEffect(() => {
    userFetch();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={'auth/register'} element={<Register />} />
        <Route path={'home'} element={<Dashboard />}>
          <Route index element={<FileList />} />
          <Route path={':folder'} element={<FileList />} />
        </Route>
        <Route path={''} element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
