import { useUserState } from '@stores/userStore.ts';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useInitializeKeys } from '@hooks/useInitKeys.ts';
import { Role } from '@models/user.ts';
import Header from '@components/header';
import Register from '@pages/register.tsx';
import Login from '@pages/login.tsx';
import AccessWrapper from './accessWrapper.tsx';
import Dashboard from '@pages/explorer/dashboard.tsx';
import NotificationIndicator from '@components/notifications';
import FileList from '@pages/explorer/fileList.tsx';
import Settings from '@pages/settings/index.tsx';
import BinPage from '@pages/explorer/pages/bin.tsx';
import RecentFiles from '@pages/explorer/pages/recent.tsx';
import Preferences from '@pages/settings/preferences';
import AccountSettings from '@pages/settings/account';
import SharePage from '@pages/share';
import SharedItems from '@pages/explorer/pages/shared.tsx';
import SecuritySettings from '@pages/settings/security';
import AppInfo from '@pages/settings/appInfo.tsx';
import UsageReport from '@pages/usage/report';
import FileListByType from '@pages/explorer/fileListByType.tsx';
import HomePage from '@pages/home';
import AdminPage from '@pages/admin';
import AdminUserList from '@pages/admin/user/list.tsx';
import AdminUser from '@pages/admin/user/single.tsx';
import DismissedOverview from '@pages/settings/dismissed';
import SystemMessage from '@components/overlay/systemMessage.tsx';
import SearchPage from '@pages/explorer/pages/search.tsx';
import FavoritesPage from '@pages/explorer/pages/favorites.tsx';
import AlbumsPage from '@pages/explorer/pages/albums/all';
import AlbumPage from '@pages/explorer/pages/albums/single';
import { Helmet } from 'react-helmet';

export function DefaultHelmet() {
  return (
    <Helmet
      titleTemplate={'%s | Kosmos'}
      defaultTitle={'Kosmos - High performance file hosting'}></Helmet>
  );
}

export default function Router() {
  const fetchUser = useUserState(s => s.fetchUser);

  useInitializeKeys();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <DefaultHelmet />
      <Header />
      <main className={'relative flex flex-grow flex-col'}>
        <Routes>
          <Route path={'auth/register'} element={<Register />} />
          <Route path={'auth/login'} element={<Login />} />
          <Route
            path={'home'}
            element={<AccessWrapper el={<Dashboard />} page={'Dashboard'} />}>
            <Route path={'files/:fileType'} element={<FileListByType />} />
            <Route path={'album'} element={<AlbumsPage />} />
            <Route path={'album/:albumId'} element={<AlbumPage />} />

            <Route path={'recent'} element={<RecentFiles />} />
            <Route
              path={'shared'}
              element={<SharedItems itemsForUser={false} />}
            />
            <Route
              path={'shares'}
              element={<SharedItems itemsForUser={true} />}
            />
            <Route path={'bin'} element={<BinPage />} />
            <Route path={'favorites'} element={<FavoritesPage />} />
            <Route path={'search'} element={<SearchPage />} />
            <Route path={'folder/:folder'} element={<FileList />} />
            <Route index element={<FileList />} />
          </Route>
          <Route
            path={'settings'}
            element={<AccessWrapper el={<Settings />} page={'Settings'} />}>
            <Route path={'dismissed'} element={<DismissedOverview />} />
            <Route path={'preferences'} element={<Preferences />} />
            <Route path={'account'} element={<AccountSettings />} />
            <Route path={'security'} element={<SecuritySettings />} />
            <Route path={'info'} element={<AppInfo />} />
            <Route index element={<AccountSettings />} />
          </Route>
          <Route
            path={'admin'}
            element={
              <AccessWrapper
                el={<AdminPage />}
                page={'Admin'}
                role={Role.Admin}
              />
            }>
            <Route path={'user'} element={<AdminUserList />} />
            <Route path={'user/:id'} element={<AdminUser />} />
          </Route>
          <Route path={'/usage/report'} element={<UsageReport />} />

          {/* Public Share */}
          <Route path={'s/:type/:uuid/*'} element={<SharePage />} />

          <Route path={'/'} element={<HomePage />} />
        </Routes>
      </main>
      <NotificationIndicator />
      <SystemMessage />
    </BrowserRouter>
  );
}
