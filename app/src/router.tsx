import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './pages/login.tsx';
import { useEffect } from 'react';
import { useUserState } from './stores/userStore.ts';
import Dashboard from './pages/dashboard.tsx';

export function Router() {
  const user = useUserState(s => s.user);
  const userFetch = useUserState(state => state.fetchUser);
  useEffect(() => {
    userFetch();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={user ? <Dashboard /> : <Login />} />
      </Routes>
    </BrowserRouter>
  );
}
