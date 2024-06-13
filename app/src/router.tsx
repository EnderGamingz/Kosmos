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
import { useKeyStore } from '@stores/keyStore.ts';

export function Router() {
  const fetchUser = useUserState(s => s.fetchUser);
  const updateKeys = useKeyStore(s => s.actions);
  const user = useUserState();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') updateKeys.toggleShift(true);
      if (e.key === 'Control') updateKeys.toggleCtrl(true);
    };

    const handleKeyUpAndFocus = (e: KeyboardEvent | FocusEvent) => {
      // As browsers don't send KeyboardEvents when a tab is inactive, always assume
      // that the Shift and Control keys are unpressed when the window regains focus,
      // to prevent the key status from becoming "stuck" on true.
      if (
        e instanceof KeyboardEvent &&
        e.key !== 'Shift' &&
        e.key !== 'Control'
      )
        return;

      updateKeys.toggleShift(false);
      updateKeys.toggleCtrl(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUpAndFocus);
    window.addEventListener('focus', handleKeyUpAndFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUpAndFocus);
      window.removeEventListener('focus', handleKeyUpAndFocus);
    };
  }, [updateKeys]);

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
